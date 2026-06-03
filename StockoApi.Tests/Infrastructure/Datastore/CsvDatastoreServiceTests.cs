using FluentAssertions;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;

namespace StockoApi.Tests.Infrastructure.Datastore
{
    public class CsvDatastoreServiceTests
    {
        [Theory]
        [MemberData(nameof(DatastoreTestData.ExpectedSymbolTickers), MemberType = typeof(DatastoreTestData))]
        public async Task Deserialize_RecordWithAllFields_ReturnsCorrectProperties(string symbol, TickerOverviewRecord expectedRecord)
        {
            var testDatastore = new CsvDatastoreService(DatastoreTestData.TestCachePath);

            var tickers = await testDatastore.GetOverviewAsync();

            var record = tickers.SingleOrDefault(t => t.Symbol == symbol);

            Assert.NotNull(record);

            record.Should().BeEquivalentTo(expectedRecord);
        }

        [Fact]
        public async Task Deserialize_RecordMissingExDivRateYield_ReturnsCorrectProperties()
        {
            var testDatastore = new CsvDatastoreService(DatastoreTestData.TestCachePath);

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
    }
}
