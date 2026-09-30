using StockoApi.Domain;

namespace StockoApi.Application.Datastore
{
    public interface IDatastoreService
    {
        public Task<IEnumerable<TickerSnapshot>> GetOverviewAsync();
    }
}
