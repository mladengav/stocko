using Microsoft.Extensions.Options;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;
using StockoApi.Infrastructure.Datastore.Options;
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
            var builder = services
                .AddOptions<DatastoreOptions>()
                .Bind(stockoConfig.GetSection(DatastoreOptions.SectionName))
                .ValidateOnStart();

            services.AddSingleton<IValidateOptions<DatastoreOptions>, DatastoreOptionsValidator>();

            //create the Datastore based on the options
            services.AddSingleton<IDatastoreService>(sp =>
            {
                var opts = sp.GetRequiredService<IOptions<DatastoreOptions>>().Value;

                var datastore = opts.DatastoreType switch
                {
                    DatastoreType.AzureBlobCsv => ActivatorUtilities.CreateInstance<AzBlobCsvDatastoreService>(sp),
                    DatastoreType.Csv => ActivatorUtilities.CreateInstance<CsvDatastoreService>(sp),
                    _ => throw new InvalidOperationException($"Unsupported DatastoreType '{opts.DatastoreType}'. ")
                };

                Log.Logger.Information("Activated datastore type:  {DatastoreType}", opts.DatastoreType);
                return datastore;
            });

            return services;
        }
    }
}
