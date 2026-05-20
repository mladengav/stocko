namespace StockoApi
{
    public interface IDatastoreService
    {
        public Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync();
    }

    public record TickerOverviewRecord(
        DateOnly SnapshotDate,
        string Symbol,
        string SectorKey,
        string IndustryKey,
        string Industry,
        string Sector,
        DateOnly ExDividendDate,
        DateOnly LastDividendDate,
        string LongName,
        decimal RegularMarketPrice,
        long RegularMarketTime,  //Unix epoch seconds
        decimal DividendRate,
        double DividendYield,
        long MarketCap,
        double PayoutRatio,
        double HeldPercentInsiders,
        double HeldPercentInstitutions,
        string QuoteType,
        string TypeDisp,
        DateOnly LastDividendDecrease,
        int YearsSinceDividendDecrease,
        int YearsConsecutiveDividendIncrease,
        decimal TtmDivs);

    public class TestDatastoreService : IDatastoreService
    {
        public async Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync()
        {
            var records = new List<TickerOverviewRecord>
            {
                new(
                    SnapshotDate: new DateOnly(2026, 5, 19),
                    Symbol: "BNS.TO",
                    SectorKey: "financial-services",
                    IndustryKey: "banks-diversified",
                    Industry: "Banks - Diversified",
                    Sector: "Financial Services",
                    ExDividendDate: new DateOnly(2026, 4, 7),
                    LastDividendDate: new DateOnly(2026, 4, 7),
                    LongName: "The Bank of Nova Scotia",
                    RegularMarketPrice: 106.33m,
                    RegularMarketTime: 1_779_220_800L,
                    DividendRate: 4.4m,
                    DividendYield: 4.14,
                    MarketCap: 130_938_339_328L,
                    PayoutRatio: 0.6469,
                    HeldPercentInsiders: 0.00021,
                    HeldPercentInstitutions: 0.50928,
                    QuoteType: "EQUITY",
                    TypeDisp: "Equity",
                    LastDividendDecrease: new DateOnly(2008, 3, 4),
                    YearsSinceDividendDecrease: 18,
                    YearsConsecutiveDividendIncrease: 12,
                    TtmDivs: 0.88m),
                new(
                    SnapshotDate: new DateOnly(2026, 5, 19),
                    Symbol: "TD.TO",
                    SectorKey: "financial-services",
                    IndustryKey: "banks-diversified",
                    Industry: "Banks - Diversified",
                    Sector: "Financial Services",
                    ExDividendDate: new DateOnly(2026, 4, 9),
                    LastDividendDate: new DateOnly(2026, 4, 9),
                    LongName: "The Toronto-Dominion Bank",
                    RegularMarketPrice: 148.38m,
                    RegularMarketTime: 1_779_220_800L,
                    DividendRate: 4.32m,
                    DividendYield: 2.91,
                    MarketCap: 248_800_067_584L,
                    PayoutRatio: 0.3425,
                    HeldPercentInsiders: 0.00044,
                    HeldPercentInstitutions: 0.55098,
                    QuoteType: "EQUITY",
                    TypeDisp: "Equity",
                    LastDividendDecrease: new DateOnly(1995, 3, 10),
                    YearsSinceDividendDecrease: 31,
                    YearsConsecutiveDividendIncrease: 16,
                    TtmDivs: 1.56m)
            };

            return await Task.FromResult(records.AsEnumerable());
        }
    }

}
