
namespace StockoApi.Infrastructure.Datastore.Options
{
    public enum DatastoreType
    {
        None = 0,
        Csv,
        AzureBlobCsv,
    }

    /// <summary>
    /// Configuration options for the datastore layer, bound from the
    /// <c>Datastore</c> configuration section.
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