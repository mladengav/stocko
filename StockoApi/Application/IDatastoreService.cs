namespace StockoApi.Application
{
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

    public interface IDatastoreService
    {
        public Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync();
    }
}
