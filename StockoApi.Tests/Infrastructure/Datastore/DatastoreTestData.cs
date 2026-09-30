using StockoApi.Domain;

namespace StockoApi.Tests.Infrastructure.Datastore
{
    /// <summary>
    /// Shared expectations for the CSV-backed datastore tests
    /// </summary>
    public static class DatastoreTestData
    {
        /// <summary>
        /// Local folder holding the sample CSVs, copied next to the test assembly
        /// (see the <c>testcache</c> Content item in <c>StockoApi.Tests.csproj</c>).
        /// </summary>
        public static readonly string TestCachePath =
            Path.Combine(new DirectoryInfo(AppContext.BaseDirectory).FullName, "testcache");

        /// <summary>
        /// Symbols whose CSV rows populate every field, paired with the record each should
        /// deserialize into. Consumed via <c>[MemberData]</c> with
        /// <c>MemberType = typeof(DatastoreTestData)</c>.
        /// </summary>
        public static TheoryData<string, TickerSnapshot> ExpectedSymbolTickers => new()
        {
            { "BCE.TO", new TickerSnapshot
            {
                SnapshotDate = new DateOnly(2026, 5, 19),
                Symbol = "BCE.TO",
                SectorKey = "communication-services",
                IndustryKey = "telecom-services",
                Industry = "Telecom Services",
                Sector = "Communication Services",
                ExDividendDate = new DateOnly(2026, 6, 15),
                LastDividendDate = new DateOnly(2026, 3, 16),
                LongName = "BCE Inc.",
                RegularMarketPrice = 32.98m,
                RegularMarketTime = 1779220800L,
                DividendRate = 1.75m,
                DividendYield = 5.35,
                MarketCap = 30754701312L,
                PayoutRatio = 0.2585,
                HeldPercentInsiders = 0.00031,
                HeldPercentInstitutions = 0.49567002,
                QuoteType = "EQUITY",
                TypeDisp = "Equity",
                LastDividendDecrease = new DateOnly(2025, 6, 16),
                YearsSinceDividendDecrease = 1,
                YearsConsecutiveDividendIncrease = 0,
                TtmDivs = 1.7520m
            } },
            { "BNS.TO", new TickerSnapshot
            {
                SnapshotDate = new DateOnly(2026, 5, 19),
                Symbol = "BNS.TO",
                SectorKey = "financial-services",
                IndustryKey = "banks-diversified",
                Industry = "Banks - Diversified",
                Sector = "Financial Services",
                ExDividendDate = new DateOnly(2026, 4, 7),
                LastDividendDate = new DateOnly(2026, 4, 7),
                LongName = "The Bank of Nova Scotia",
                RegularMarketPrice = 106.33m,
                RegularMarketTime = 1779220800L,
                DividendRate = 4.4m,
                DividendYield = 4.14,
                MarketCap = 130938339328L,
                PayoutRatio = 0.6469,
                HeldPercentInsiders = 0.00021,
                HeldPercentInstitutions = 0.50928,
                QuoteType = "EQUITY",
                TypeDisp = "Equity",
                LastDividendDecrease = new DateOnly(1995, 3, 29),
                YearsSinceDividendDecrease = 31,
                YearsConsecutiveDividendIncrease = 15,
                TtmDivs = 4.4000m
            } },
        };

        /// <summary>
        /// CU.TO is missing the ExDividendDate, DividendRate, and DividendYield fields in the
        /// test CSV; every other field should still deserialize to the values below.
        /// </summary>
        public static TickerSnapshot ExpectedCu => new TickerSnapshot
        {
            SnapshotDate = new DateOnly(2026, 5, 20),
            Symbol = "CU.TO",
            SectorKey = "utilities",
            IndustryKey = "utilities-diversified",
            Industry = "Utilities - Diversified",
            Sector = "Utilities",
            ExDividendDate = default,
            LastDividendDate = new DateOnly(2026, 5, 7),
            LongName = "Canadian Utilities Limited",
            RegularMarketPrice = 49.12m,
            RegularMarketTime = 1779294060L,
            DividendRate = default,
            DividendYield = default,
            MarketCap = 13376141312L,
            PayoutRatio = 0.0,
            HeldPercentInsiders = 0.0033000002,
            HeldPercentInstitutions = 0.19692,
            QuoteType = "EQUITY",
            TypeDisp = "Equity",
            LastDividendDecrease = new DateOnly(2013, 8, 8),
            YearsSinceDividendDecrease = 13,
            YearsConsecutiveDividendIncrease = 13,
            TtmDivs = 1.8400m
        };

        /// <summary>
        /// tickers.csv content whose date cells are whitespace-only (WS.TO) or unparseable
        /// (BAD.TO), alongside a well-formed control row (OK.TO). Written to a temporary
        /// folder by the test so the shared <c>testcache</c> files stay untouched.
        /// </summary>
        public const string MalformedDatesTickersCsv =
            """
            snapshotDate,symbol,sectorKey,industryKey,industry,sector,exDividendDate,lastDividendDate,longName,regularMarketPrice,regularMarketTime,dividendRate,dividendYield,marketCap,payoutRatio,heldPercentInsiders,heldPercentInstitutions,quoteType,typeDisp
            2026-05-20,WS.TO,utilities,utilities-diversified,Utilities - Diversified,Utilities, , ,Whitespace Dates Inc.,10.00,1779294060,0.50,5.0,1000000,0.5,0.01,0.5,EQUITY,Equity
            2026-05-20,BAD.TO,utilities,utilities-diversified,Utilities - Diversified,Utilities,not-a-date,n/a,Malformed Dates Inc.,10.00,1779294060,0.50,5.0,1000000,0.5,0.01,0.5,EQUITY,Equity
            2026-05-20,OK.TO,utilities,utilities-diversified,Utilities - Diversified,Utilities,2026-06-15,1778112000,Valid Dates Inc.,10.00,1779294060,0.50,5.0,1000000,0.5,0.01,0.5,EQUITY,Equity
            """;

        /// <summary>
        /// aggregations/last_dividend_decrease.csv content matching <see cref="MalformedDatesTickersCsv"/>.
        /// </summary>
        public const string MalformedDatesLastDividendDecreaseCsv =
            """
            "ticker","last_dividend_decrease"
            "WS.TO","  "
            "BAD.TO","unknown"
            "OK.TO","2013-08-08"
            """;

        /// <summary>
        /// Expected date fields per symbol in the malformed-dates CSVs: blank or unparseable
        /// values become <c>null</c> for the nullable ExDividendDate and <c>default(DateOnly)</c>
        /// for the non-nullable LastDividendDate and LastDividendDecrease.
        /// </summary>
        public static TheoryData<string, DateOnly?, DateOnly, DateOnly> ExpectedMalformedDates => new()
        {
            { "WS.TO", null, default, default },
            { "BAD.TO", null, default, default },
            { "OK.TO", new DateOnly(2026, 6, 15), new DateOnly(2026, 5, 7), new DateOnly(2013, 8, 8) },
        };
    }
}
