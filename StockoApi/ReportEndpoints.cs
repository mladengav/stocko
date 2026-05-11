namespace StockoApi
{
    public static class ReportEndpoints
    {
        public static void MapReportEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("create-position-report", async (List<Position> positions, IReportService reportService) =>
            {
                var aggregatedPositions = await reportService.CreatePositionReportAsync(positions).ToListAsync();



                return TypedResults.Json(aggregatedPositions, statusCode: StatusCodes.Status200OK);
            })
            .WithName("CreatePositionReport")
            .WithDescription("Create a report of positions with aggregated data based on the given quantities");
        }
    }
}
