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
        DateOnly ExDividendDateUtc,
        string LongName,
        decimal CurrentPrice,
        decimal DividendRate,
        double DividendYield,
        long MarketCap,
        double PayoutRatio,
        decimal TtmDivs);

    public class TestDatastoreService : IDatastoreService
    {
        public async Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync()
        {
            var records = new List<TickerOverviewRecord>
            {
                new(
                    SnapshotDate: new DateOnly(2025, 5, 15),
                    Symbol: "BNS.TO",
                    SectorKey: "financial-services",
                    IndustryKey: "banks-diversified",
                    ExDividendDateUtc: new DateOnly(2025, 4, 1),
                    LongName: "The Bank of Nova Scotia",
                    CurrentPrice: 62.50m,
                    DividendRate: 4.24m,
                    DividendYield: 0.0678,
                    MarketCap: 75_000_000_000L,
                    PayoutRatio: 0.65,
                    TtmDivs: 0.88m),
                new(
                    SnapshotDate: new DateOnly(2025, 5, 15),
                    Symbol: "TD.TO",
                    SectorKey: "financial-services",
                    IndustryKey: "banks-diversified",
                    ExDividendDateUtc: new DateOnly(2025, 4, 10),
                    LongName: "The Toronto-Dominion Bank",
                    CurrentPrice: 80.10m,
                    DividendRate: 4.08m,
                    DividendYield: 0.0509,
                    MarketCap: 140_000_000_000L,
                    PayoutRatio: 0.55,
                    TtmDivs: 1.56m)
            };

            return await Task.FromResult(records.AsEnumerable());
        }
    }

}
