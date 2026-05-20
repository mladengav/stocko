namespace StockoApi.Application
{
    public record Position(string Symbol, int Quantity);

    public record PositionOverviewRecord(Position Position, decimal TtmDivs);

    public interface IReportService
    {
        public IAsyncEnumerable<PositionOverviewRecord> CreatePositionReportAsync(IEnumerable<Position> positions);
    }
}
