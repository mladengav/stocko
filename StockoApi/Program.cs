using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore;
using StockoApi.Infrastructure.Datastore.Options;
using StockoApi.Infrastructure.Report;
using StockoApi.Presentation;

namespace StockoApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthorization();

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            // ── Datastore options ──────────────────────────────────────────────────
            // Bind the "Datastore" config section, register the custom validator, and
            // opt into startup validation so a misconfigured app fails fast rather than
            // at the first request.
            builder.Services
                .AddOptions<DatastoreOptions>()
                .BindConfiguration(DatastoreOptions.SectionName)
                .ValidateOnStart();

            builder.Services
                .AddSingleton<IValidateOptions<DatastoreOptions>,
                              DatastoreOptionsValidator>();

            // ── Datastore implementation ───────────────────────────────────────────
            // The concrete type is chosen at runtime based on DatastoreType so that
            // only one implementation is ever instantiated.
            builder.Services.AddSingleton<IDatastoreService>(sp =>
            {
                var opts = sp.GetRequiredService<IOptions<DatastoreOptions>>().Value;

                return opts.DatastoreType switch
                {
                    DatastoreType.AzureBlobCsv =>
                        ActivatorUtilities.CreateInstance<AzBlobCsvDatastoreService>(sp),

                    DatastoreType.Csv =>
                        ActivatorUtilities.CreateInstance<CsvDatastoreService>(sp),

                    _ => throw new InvalidOperationException(
                             $"Unsupported DatastoreType '{opts.DatastoreType}'. " +
                             $"Expected one of: {string.Join(", ", Enum.GetNames<DatastoreType>())}.")
                };
            });

            builder.Services.AddScoped<IReportService, ReportService>();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapDatastoreEndpoints();
            app.MapReportEndpoints();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}