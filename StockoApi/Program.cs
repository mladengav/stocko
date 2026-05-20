
using Scalar.AspNetCore;

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

            builder.Services.AddSingleton<IDatastoreService, CsvDatastoreService>();
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
