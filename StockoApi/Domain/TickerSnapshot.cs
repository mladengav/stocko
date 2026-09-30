namespace StockoApi.Domain
{
    public sealed class TickerSnapshot
    {
        public required DateOnly SnapshotDate { get; init; }
        public required string Symbol { get; init; }
        public string SectorKey { get; set; } = string.Empty;
        public string IndustryKey { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public DateOnly? ExDividendDate { get; set; }
        public DateOnly LastDividendDate { get; set; }
        public string LongName { get; set; } = string.Empty;
        public decimal RegularMarketPrice { get; set; }
        public long RegularMarketTime { get; set; }  //Unix epoch seconds
        public decimal DividendRate { get; set; }
        public double DividendYield { get; set; }
        public long MarketCap { get; set; }
        public double PayoutRatio { get; set; }
        public double HeldPercentInsiders { get; set; }
        public double HeldPercentInstitutions { get; set; }
        public string QuoteType { get; set; } = string.Empty;
        public string TypeDisp { get; set; } = string.Empty;
        public DateOnly LastDividendDecrease { get; set; }
        public int YearsSinceDividendDecrease { get; set; }
        public int YearsConsecutiveDividendIncrease { get; set; }
        public decimal TtmDivs { get; set; }
    }
}
