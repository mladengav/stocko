using FluentAssertions;
using StockoApi.Domain;
using StockoApi.Infrastructure.Datastore;

namespace StockoApi.Tests.Infrastructure.Datastore
{
    public class CsvDatastoreServiceTests
    {
        [Theory]
        [MemberData(nameof(DatastoreTestData.ExpectedSymbolTickers), MemberType = typeof(DatastoreTestData))]
        public async Task Deserialize_RecordWithAllFields_ReturnsCorrectProperties(string symbol, TickerSnapshot expectedRecord)
        {
            var testDatastore = new CsvDatastoreService(DatastoreTestData.TestCachePath);

            var tickers = await testDatastore.GetOverviewAsync();

            var record = tickers.Single(t => t.Symbol == symbol);

            record.Should().BeEquivalentTo(expectedRecord);
        }

        [Fact]
        public async Task Deserialize_RecordMissingExDivRateYield_ReturnsCorrectProperties()
        {
            var testDatastore = new CsvDatastoreService(DatastoreTestData.TestCachePath);

            var tickers = await testDatastore.GetOverviewAsync();

            //CU is missing the ExDividendDate, DividendRate, and DividendYield fields in the test CSV,
            //but the rest of the fields should deserialize correctly.
            var record = tickers.Single(t => t.Symbol == "CU.TO");

            //verify explicit properties that should be missing
            Assert.Equal("CU.TO", record.Symbol);
            Assert.Equal(default, record.ExDividendDate);
            Assert.Equal(default, record.DividendRate);
            Assert.Equal(default, record.DividendYield);

            //verify the rest
            record.Should().BeEquivalentTo(DatastoreTestData.ExpectedCu);
        }

        [Theory]
        [MemberData(nameof(DatastoreTestData.ExpectedMalformedDates), MemberType = typeof(DatastoreTestData))]
        public async Task Deserialize_RecordWithBlankOrMalformedDates_FallsBackWithoutFailing(
            string symbol, DateOnly? expectedExDividendDate, DateOnly expectedLastDividendDate, DateOnly expectedLastDividendDecrease)
        {
            var cacheFolder = Directory.CreateTempSubdirectory("stocko-tests-");
            try
            {
                var aggregationsFolder = cacheFolder.CreateSubdirectory("aggregations");
                await File.WriteAllTextAsync(
                    Path.Combine(cacheFolder.FullName, "tickers.csv"),
                    DatastoreTestData.MalformedDatesTickersCsv,
                    TestContext.Current.CancellationToken);
                await File.WriteAllTextAsync(
                    Path.Combine(aggregationsFolder.FullName, "last_dividend_decrease.csv"),
                    DatastoreTestData.MalformedDatesLastDividendDecreaseCsv,
                    TestContext.Current.CancellationToken);

                var testDatastore = new CsvDatastoreService(cacheFolder.FullName);

                var tickers = await testDatastore.GetOverviewAsync();

                var record = tickers.Single(t => t.Symbol == symbol);

                Assert.Equal(expectedExDividendDate, record.ExDividendDate);
                Assert.Equal(expectedLastDividendDate, record.LastDividendDate);
                Assert.Equal(expectedLastDividendDecrease, record.LastDividendDecrease);
            }
            finally
            {
                cacheFolder.Delete(recursive: true);
            }
        }
    }
}
