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

                return opts.DatastoreType switch
                {
                    DatastoreType.AzureBlobCsv => ActivateAzBlobCsvDatastore(),

                    DatastoreType.Csv => ActivateCsvDatastore(),

                    _ => throw new InvalidOperationException(
                             $"Unsupported DatastoreType '{opts.DatastoreType}'. " +
                             $"Expected one of: {string.Join(", ", Enum.GetNames<DatastoreType>())}.")
                };

                AzBlobCsvDatastoreService ActivateAzBlobCsvDatastore()
                {
                    var datastore = ActivatorUtilities.CreateInstance<AzBlobCsvDatastoreService>(sp);
                    Log.Logger.Information("Activated datastore type:  {DatastoreType}", DatastoreType.AzureBlobCsv);
                    return datastore;
                }

                CsvDatastoreService ActivateCsvDatastore()
                {
                    var datastore = ActivatorUtilities.CreateInstance<CsvDatastoreService>(sp);
                    Log.Logger.Information("Activated datastore type:  {DatastoreType}", DatastoreType.Csv);
                    return datastore;
                }
            });

            return services;
        }
    }
}
