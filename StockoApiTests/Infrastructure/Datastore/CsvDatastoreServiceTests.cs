using FluentAssertions;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;

namespace StockoApiTests.Infrastructure.Datastore
{
    public class CsvDatastoreServiceTests
    {
        private static readonly string basePath = new DirectoryInfo(AppContext.BaseDirectory).FullName;
        private static readonly string TESTCACHE_PATH = Path.Combine(basePath, "testcache");

        public static TheoryData<string, TickerOverviewRecord> ExpectedSymbolTickers => new()
        {
            { "BCE.TO", new TickerOverviewRecord
            (
                SnapshotDate: new DateOnly(2026, 5, 19),
                Symbol: "BCE.TO",
                SectorKey: "communication-services",
                IndustryKey: "telecom-services",
                Industry: "Telecom Services",
                Sector: "Communication Services",
                ExDividendDate: new DateOnly(2026, 6, 15),
                LastDividendDate: new DateOnly(2026, 3, 16),
                LongName: "BCE Inc.",
                RegularMarketPrice: 32.98m,
                RegularMarketTime: 1779220800L,
                DividendRate: 1.75m,
                DividendYield: 5.35,
                MarketCap: 30754701312L,
                PayoutRatio: 0.2585,
                HeldPercentInsiders: 0.00031,
                HeldPercentInstitutions: 0.49567002,
                QuoteType: "EQUITY",
                TypeDisp: "Equity",
                LastDividendDecrease: new DateOnly(2025, 6, 16),
                YearsSinceDividendDecrease: 1,
                YearsConsecutiveDividendIncrease: 0,
                TtmDivs: 1.7520m
            ) },
            { "BNS.TO", new TickerOverviewRecord
            (
                SnapshotDate: new DateOnly(2026, 5, 19),
                Symbol: "BNS.TO",
                SectorKey: "financial-services",
                //1775520000,1775520000,106.33,1779220800,4.4,4.14,130938339328,0.6469,0.00021,0.50928,EQUITY,Equity
                IndustryKey: "banks-diversified",
                Industry: "Banks - Diversified",
                Sector: "Financial Services",
                ExDividendDate: new DateOnly(2026, 4, 7),
                LastDividendDate: new DateOnly(2026, 4, 7),
                LongName: "The Bank of Nova Scotia",
                RegularMarketPrice: 106.33m,
                RegularMarketTime: 1779220800L,
                DividendRate: 4.4m,
                DividendYield: 4.14,
                MarketCap: 130938339328L,
                PayoutRatio: 0.6469,
                HeldPercentInsiders: 0.00021,
                HeldPercentInstitutions: 0.50928,
                QuoteType: "EQUITY",
                TypeDisp: "Equity",
                LastDividendDecrease: new DateOnly(1995, 3, 29),
                YearsSinceDividendDecrease: 31,
                YearsConsecutiveDividendIncrease: 15,
                TtmDivs: 4.4000m
            ) },
        };

        [Theory]
        [MemberData(nameof(ExpectedSymbolTickers))]
        public async Task Deserialize_RecordWithAllFields_ReturnsCorrectProperties(string symbol, TickerOverviewRecord expectedRecord)
        {
            var testDatastore = new CsvDatastoreService(TESTCACHE_PATH);

            var tickers = await testDatastore.GetOverviewAsync();

            var record = tickers.SingleOrDefault(t => t.Symbol == symbol);

            Assert.NotNull(record);

            record.Should().BeEquivalentTo(expectedRecord);
        }

        [Fact]
        public async Task Deserialize_RecordMissingExDivRateYield_ReturnsCorrectProperties()
        {
            var testDatastore = new CsvDatastoreService(TESTCACHE_PATH);

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
            var expectedCu = new TickerOverviewRecord
            (
                SnapshotDate: new DateOnly(2026, 5, 20),
                Symbol: "CU.TO",
                SectorKey: "utilities",
                IndustryKey: "utilities-diversified",
                Industry: "Utilities - Diversified",
                Sector: "Utilities",
                ExDividendDate: default,
                LastDividendDate: new DateOnly(2026, 5, 7),
                LongName: "Canadian Utilities Limited",
                RegularMarketPrice: 49.12m,
                RegularMarketTime: 1779294060L,
                DividendRate: default,
                DividendYield: default,
                MarketCap: 13376141312L,
                PayoutRatio: 0.0,
                HeldPercentInsiders: 0.0033000002,
                HeldPercentInstitutions: 0.19692,
                QuoteType: "EQUITY",
                TypeDisp: "Equity",
                LastDividendDecrease: new DateOnly(2013, 8, 8),
                YearsSinceDividendDecrease: 13,
                YearsConsecutiveDividendIncrease: 13,
                TtmDivs: 1.8400m
            );

            record.Should().BeEquivalentTo(expectedCu);
        }
    }
}
