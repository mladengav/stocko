namespace StockoApi
{
    public static class DatastoreEndpoints
    {
        public static void MapDatastoreEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("overview", async (IDatastoreService datastoreService) =>
            {
                var tickers = await datastoreService.GetOverviewAsync();



                return TypedResults.Json(tickers, statusCode: StatusCodes.Status200OK);
            })
            .WithName("GetOverview")
            .WithDescription("Get overview of available tickers in the data store");
        }
    }
}
