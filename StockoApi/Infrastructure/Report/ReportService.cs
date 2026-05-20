using StockoApi.Application;

namespace StockoApi.Infrastructure.Report
{
    public class ReportService(IDatastoreService dataStore) : IReportService
    {
        private readonly IDatastoreService DataStore = dataStore;

        public async IAsyncEnumerable<PositionOverviewRecord> CreatePositionReportAsync(IEnumerable<Position> positions)
        {
            var perTicker = await DataStore.GetOverviewAsync();
            var dict = perTicker.ToDictionary(tor => tor.Symbol);

            foreach (var pos in positions)
            {
                if (dict.TryGetValue(pos.Symbol, out var tor))
                {
                    yield return AggregatePosition(pos, tor);
                }
                else
                {
                    yield return new PositionOverviewRecord(pos, 0m);
                }
            }
        }

        private static PositionOverviewRecord AggregatePosition(Position position, TickerOverviewRecord ticker)
        {
            return new PositionOverviewRecord(position, ticker.TtmDivs * position.Quantity);
        }
    }
}
