using StockoApi.Application.Datastore;
using StockoApi.Domain;

namespace StockoApi.Application.Report
{
    public class ReportService(IDatastoreService dataStore) : IReportService
    {
        private readonly IDatastoreService DataStore = dataStore;

        public async IAsyncEnumerable<PositionSnapshot> CreatePositionReportAsync(IEnumerable<Position> positions)
        {
            var perTicker = await DataStore.GetOverviewAsync();
            //TODO consider adding snapshot date tot he key, if multiple snapshots are stored in the future
            var dict = perTicker.ToDictionary(tickerSnapshot => tickerSnapshot.Symbol);

            foreach (var pos in positions)
            {
                var tickerSnapshot = dict.GetValueOrDefault(pos.Symbol);
                yield return PositionSnapshot.From(pos, tickerSnapshot);
            }
        }
    }
}