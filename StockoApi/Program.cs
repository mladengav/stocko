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

                //TODO:  Add ProblemDetails and GlobalExceptionHandler when endpoints are expanded to return custom errors

                // Add services to the container.
                builder.Services.AddAuthorization();

                // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
                builder.Services.AddOpenApi();

                var stockoConfig = builder.Configuration.GetSection(StockoConfiguration.SectionName);

                builder.Services.AddStockoDatastore(stockoConfig);

                builder.Services.AddScoped<IReportService, ReportService>();

                var app = builder.Build();
                                
                app.UseSerilogRequestLogging();

                // Configure the HTTP request pipeline.
                app.UseHttpsRedirection();
                app.UseDefaultFiles();

                app.UseAuthorization();
                
                if (app.Environment.IsDevelopment())
                {
                    app.MapOpenApi();
                    app.MapScalarApiReference();
                }
                
                app.MapStaticAssets();
                app.MapFallbackToFile("/index.html");

                app.MapDatastoreEndpoints();
                app.MapReportEndpoints();
                
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
    }
}