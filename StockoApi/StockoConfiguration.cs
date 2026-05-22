using StockoApi.Infrastructure.Datastore.Options;

namespace StockoApi
{
    /// <summary>
    /// Root configuration object for the Stocko application, bound from the
    /// <c>Stocko</c> section of <c>appsettings.json</c> (or any other
    /// configuration source). Add top-level sub-sections here as the application grows.
    /// </summary>
    public sealed class StockoConfiguration
    {
        /// <summary>The configuration section name.</summary>
        public const string SectionName = "Stocko";

        public DatastoreOptions Datastore { get; set; } = new();
    }
}
