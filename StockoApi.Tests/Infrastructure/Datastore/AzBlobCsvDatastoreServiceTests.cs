using Azure.Storage.Blobs;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;
using StockoApi.Infrastructure.Datastore.Options;
using Testcontainers.Azurite;

namespace StockoApi.Tests.Infrastructure.Datastore
{
    /// <summary>
    /// Tests against an Azurite (Azure Storage emulator) container once per test class,
    /// populated with the contents of <c>testcache/</c>
    /// </summary>
    public sealed class AzuriteCsvCacheFixture : IAsyncLifetime
    {
        public const string ContainerName = "csvcache";

        // Pin Azurite explicitly: it caps which Storage REST API version it accepts, and the
        // Azure.Storage.Blobs SDK negotiates a newer version than older Azurite builds support.
        private const string AzuriteImage = "mcr.microsoft.com/azure-storage/azurite:3.35.0";

        // Newest REST API version Azurite 3.35.0 understands. The SDK would otherwise default to
        // a version Azurite rejects with "API version ... is not supported".
        private const BlobClientOptions.ServiceVersion SupportedApiVersion =
            BlobClientOptions.ServiceVersion.V2025_11_05;

        private readonly AzuriteContainer _azurite = new AzuriteBuilder(AzuriteImage).Build();

        public BlobServiceClient BlobServiceClient { get; private set; } = null!;

        public async ValueTask InitializeAsync()
        {
            await _azurite.StartAsync();

            BlobServiceClient = new BlobServiceClient(
                _azurite.GetConnectionString(),
                new BlobClientOptions(SupportedApiVersion));

            var container = BlobServiceClient.GetBlobContainerClient(ContainerName);
            await container.CreateIfNotExistsAsync();

            await UploadDirectoryAsync(container, DatastoreTestData.TestCachePath);
        }

        public async ValueTask DisposeAsync()
        {
            // Remove the seeded container, then dispose the emulator.
            if (BlobServiceClient is not null)
            {
                var container = BlobServiceClient.GetBlobContainerClient(ContainerName);
                await container.DeleteIfExistsAsync();
            }

            await _azurite.DisposeAsync();
        }

        /// <summary>
        /// Uploads every file under <paramref name="rootDir"/> as a blob whose name is the
        /// file's path relative to the root, using forward slashes (mirroring how
        /// <see cref="AzBlobCsvDatastoreService"/> maps blob names back to local paths).
        /// </summary>
        private static async Task UploadDirectoryAsync(BlobContainerClient container, string rootDir)
        {
            foreach (var file in Directory.EnumerateFiles(rootDir, "*", SearchOption.AllDirectories))
            {
                var relative = Path.GetRelativePath(rootDir, file).Replace(Path.DirectorySeparatorChar, '/');
                var blob = container.GetBlobClient(relative);
                await blob.UploadAsync(file, overwrite: true);
            }
        }
    }

    public class AzBlobCsvDatastoreServiceTests(AzuriteCsvCacheFixture fixture)
        : IClassFixture<AzuriteCsvCacheFixture>
    {
        private readonly AzuriteCsvCacheFixture _fixture = fixture;

        [Theory]
        [MemberData(nameof(DatastoreTestData.ExpectedSymbolTickers), MemberType = typeof(DatastoreTestData))]
        public async Task Deserialize_RecordWithAllFields_ReturnsCorrectProperties(string symbol, TickerOverviewRecord expectedRecord)
        {
            using var testDatastore = CreateService();

            var tickers = await testDatastore.GetOverviewAsync();

            var record = tickers.SingleOrDefault(t => t.Symbol == symbol);

            Assert.NotNull(record);

            record.Should().BeEquivalentTo(expectedRecord);
        }

        [Fact]
        public async Task Deserialize_RecordMissingExDivRateYield_ReturnsCorrectProperties()
        {
            using var testDatastore = CreateService();

            var tickers = await testDatastore.GetOverviewAsync();

            //CU is missing the ExDividendDate, DividendRate, and DividendYield fields in the test CSV,
            //but the rest of the fields should deserialize correctly.
            var record = tickers.SingleOrDefault(t => t.Symbol == "CU.TO");

            Assert.NotNull(record);

            //verify explicit properties that should be missing
            Assert.Equal("CU.TO", record.Symbol);
            Assert.Equal(default, record.ExDividendDate);
            Assert.Equal(default, record.DividendRate);
            Assert.Equal(default, record.DividendYield);

            //verify the rest
            record.Should().BeEquivalentTo(DatastoreTestData.ExpectedCu);
        }

        /// <summary>
        /// Builds the service against the shared Azurite container, syncing blobs into a
        /// fresh local cache folder so each test starts from a clean download.
        /// </summary>
        private AzBlobCsvDatastoreService CreateService()
        {
            var cacheFolder = Path.Combine(
                Path.GetTempPath(), "stocko-azblob-tests", Guid.NewGuid().ToString("N"));

            var options = Options.Create(new DatastoreOptions { CsvCacheFolder = cacheFolder });
            var config = new ConfigurationBuilder().Build();

            return new AzBlobCsvDatastoreService(
                _fixture.BlobServiceClient,
                options,
                config,
                NullLogger<AzBlobCsvDatastoreService>.Instance);
        }
    }
}
