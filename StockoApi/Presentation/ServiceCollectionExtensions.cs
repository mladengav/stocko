using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;
using StockoApi.Infrastructure.Datastore.Options;
using StockoApi.Presentation.Filters;
using Serilog;

namespace StockoApi.Presentation
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Binds and validates <see cref="DatastoreOptions"/> and adds the <see cref="IDatastoreService"/>
        /// implementation to the service collection based on the configuration.
        /// </summary>
        public static IServiceCollection AddStockoDatastore(
            this IServiceCollection services,
            IConfigurationSection stockoConfig)
        {
            //set the options
            var datastoreSection = stockoConfig.GetSection(DatastoreOptions.SectionName);

            var builder = services
                .AddOptions<DatastoreOptions>()
                .Bind(datastoreSection)
                .ValidateOnStart();

            services.AddSingleton<IValidateOptions<DatastoreOptions>, DatastoreOptionsValidator>();

            // Keyed memory cache as datastore overview is not expected to change frequently
            services.AddKeyedSingleton<IMemoryCache>(
                DatastoreCacheEndpointFilter.CacheServiceKey,
                (sp, _) =>
                {
                    var opts = sp.GetRequiredService<IOptions<DatastoreOptions>>().Value;
                    return new MemoryCache(new MemoryCacheOptions
                    {
                        SizeLimit = opts.CacheMaxItemCount,
                    });
                });

            // Select and register the datastore (and any services it depends on) based on the
            // configured type. This happens at registration time because backends like AzureBlobCsv
            // register their own backing services
            var datastoreOptions = datastoreSection.Get<DatastoreOptions>() ?? new DatastoreOptions();

            switch (datastoreOptions.DatastoreType)
            {
                case DatastoreType.AzureBlobCsv:
                    services.AddAzureBlobCsvDatastore();
                    break;
                case DatastoreType.Csv:
                    services.AddCsvDatastore();
                    break;
                default:
                    throw new InvalidOperationException($"Unsupported DatastoreType '{datastoreOptions.DatastoreType}'. ");
            }

            return services;
        }

        /// <summary>
        /// Registers the Azure Blob CSV datastore: the backing <see cref="BlobServiceClient"/>
        /// and the <see cref="AzBlobCsvDatastoreService"/> that consumes it.
        /// </summary>
        private static IServiceCollection AddAzureBlobCsvDatastore(this IServiceCollection services)
        {
            // The client factory defers construction to resolution time, so the options
            // validator (ValidateOnStart) runs first and guarantees the Azure settings are present.
            services.AddAzureClients(clientBuilder =>
            {
                clientBuilder.AddClient<BlobServiceClient, BlobClientOptions>(
                    (_, _, sp) =>
                    {
                        var opts = sp.GetRequiredService<IOptions<DatastoreOptions>>().Value;
                        return new BlobServiceClient(
                            new Uri(opts.AzureStorageBlobUrl!),
                            new ClientSecretCredential(
                                opts.AzureTenantId,
                                opts.AzureClientId,
                                opts.AzureClientSecret));
                    });
            });

            return services.AddSingleton<IDatastoreService>(sp =>
            {
                var datastore = ActivatorUtilities.CreateInstance<AzBlobCsvDatastoreService>(sp);
                Log.Logger.Information("Activated datastore type:  {DatastoreType}", DatastoreType.AzureBlobCsv);
                return datastore;
            });
        }

        private static IServiceCollection AddCsvDatastore(this IServiceCollection services)
        {
            return services.AddSingleton<IDatastoreService>(sp =>
            {
                var datastore = ActivatorUtilities.CreateInstance<CsvDatastoreService>(sp);
                Log.Logger.Information("Activated datastore type:  {DatastoreType}", DatastoreType.Csv);
                return datastore;
            });
        }
    }
}
