using StockoApi.Infrastructure.Datastore.Options;

namespace StockoApi
{
    /// <summary>
    /// Root configuration object for the Stocko application
    /// </summary>
    public sealed class StockoConfiguration
    {
        /// <summary>The configuration section name.</summary>
        public const string SectionName = "Stocko";

        public DatastoreOptions Datastore { get; set; } = new();
    }
}
