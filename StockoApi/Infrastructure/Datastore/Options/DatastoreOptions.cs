
namespace StockoApi.Infrastructure.Datastore.Options
{
    public enum DatastoreType
    {
        None = 0,
        Csv,
        AzureBlobCsv,
    }

    /// <summary>
    /// Configuration options for the datastore layer
    /// </summary>
    public sealed class DatastoreOptions
    {
        /// <summary>The configuration section name.</summary>
        public const string SectionName = "Datastore";

        /// <summary>
        /// Selects the datastore implementation (<see cref="DatastoreType.Csv"/>
        /// or <see cref="DatastoreType.AzureBlobCsv"/>).
        /// </summary>
        public DatastoreType DatastoreType { get; set; }

        /// <summary>
        /// Absolute or relative path to the local CSV cache folder.
        /// Required for both datastore types.
        /// </summary>
        public string CsvCacheFolder { get; set; } = "cache";

        // ── In-memory overview cache ──────────────────────────────────────────

        /// <summary>
        /// Sliding expiration, in minutes, for the cached ticker overview list.
        /// The entry is evicted if it is not read within this window.
        /// </summary>
        public int CacheSlidingExpirationMinutes { get; set; } = 5;

        /// <summary>
        /// Absolute expiration, in minutes, for the cached ticker overview list.
        /// The entry is always evicted once this window elapses, regardless of reads.
        /// </summary>
        public int CacheAbsoluteExpirationMinutes { get; set; } = 10;

        /// <summary>
        /// Maximum number of overview records the cache may hold. Used as the
        /// <c>SizeLimit</c> of the "DatastoreCache" memory cache.
        /// </summary>
        public long CacheMaxItemCount { get; set; } = 10_000;

        // ── Azure Blob Storage ────────────────────────────────────────────────
        // Required when DatastoreType is AzureBlobCsv.

        /// <summary>
        /// Base URL of the Azure Storage account
        /// (e.g. <c>https://&lt;account&gt;.blob.core.windows.net</c>).
        /// </summary>
        public string? AzureStorageBlobUrl { get; set; }

        /// <summary>Service-principal client (application) ID.</summary>
        public string? AzureClientId { get; set; }

        /// <summary>Azure Active Directory tenant ID.</summary>
        public string? AzureTenantId { get; set; }

        /// <summary>Service-principal client secret.</summary>
        public string? AzureClientSecret { get; set; }
    }
}