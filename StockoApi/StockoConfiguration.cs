using StockoApi.Infrastructure.Datastore.Options;

namespace StockoApi
{
    public class StockoConfiguration
    {
        public DatastoreOptions DatastoreOptions { get; init; } = new();
    }
}
