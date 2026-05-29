using Scalar.AspNetCore;
using Serilog;
using StockoApi.Application;
using StockoApi.Infrastructure.Report;
using StockoApi.Presentation;

namespace StockoApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Verbose()
                .WriteTo.Console()
                .CreateBootstrapLogger();

            try
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Services.AddSerilog((services, lc) => lc
                    .ReadFrom.Configuration(builder.Configuration)
                    .ReadFrom.Services(services));

                //TODO:  Add ProblemDetails and GlobalExceptionHandler

                // Add services to the container.
                builder.Services.AddAuthorization();

                // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
                builder.Services.AddOpenApi();

                var stockoConfig = builder.Configuration.GetSection(StockoConfiguration.SectionName);

                builder.Services.AddStockoDatastore(stockoConfig);

                builder.Services.AddScoped<IReportService, ReportService>();

                var app = builder.Build();

                app.UseSerilogRequestLogging();

                if (app.Environment.IsDevelopment() is false)
                {
                    WarnOnNonDevMissingHttpsConfig(builder.Configuration);

                    // Configure the HTTP request pipeline.
                    app.UseHttpsRedirection();
                }

                //UseFileServer instead of MapStaticAssets because React code is built separately
                //and packaged at container image build time
                app.UseFileServer();

                app.UseAuthorization();
                
                if (app.Environment.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                    app.MapOpenApi();
                    app.MapScalarApiReference();
                }
                
                app.MapDatastoreEndpoints();
                app.MapReportEndpoints();

                app.MapFallbackToFile("/index.html");

                app.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Stocko API terminated unexpectedly");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        private static void WarnOnNonDevMissingHttpsConfig(ConfigurationManager config)
        {
            bool isConfigHttpsPorMissing = string.IsNullOrWhiteSpace(config["https_port"]);
            bool isEnvAspNetHttpsPortMissing = string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS"));
            bool isEnvAspNetHttpsUrlMissing = (Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? string.Empty)
                .Contains("https://", StringComparison.OrdinalIgnoreCase) is false;

            bool isHttpsConfigMissing = isConfigHttpsPorMissing && isEnvAspNetHttpsPortMissing && isEnvAspNetHttpsUrlMissing;
            if (isHttpsConfigMissing)
            {
                Log.Warning("HTTPS endpoint may not be not configured but environment is not development.");
                Log.Warning("Please set the 'ASPNETCORE_HTTPS_PORTS' environment variable, along with trusted Kestrel certificates.");
                Log.Warning("Alternatively, to use HTTP, set ASPNETCORE_ENVIRONMENT to 'Development'");
            }
        }
    }
}
