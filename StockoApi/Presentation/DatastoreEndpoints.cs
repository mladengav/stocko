using StockoApi.Application;
using StockoApi.Presentation.Filters;

namespace StockoApi.Presentation
{
    public static class DatastoreEndpoints
    {
        public static void MapDatastoreEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/datastore").WithTags("Datastore");

            group.MapGet("overview", async (IDatastoreService datastoreService) =>
            {
                var tickers = await datastoreService.GetOverviewAsync();

                return TypedResults.Json(tickers, statusCode: StatusCodes.Status200OK);
            })
            .AddEndpointFilter<DatastoreCacheEndpointFilter>()
            .WithName("GetOverview")
            .WithDescription("Get overview of available tickers in the data store");
        }
    }
}
