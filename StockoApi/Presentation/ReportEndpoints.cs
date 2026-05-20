using StockoApi.Application;

namespace StockoApi.Presentation
{
    public static class ReportEndpoints
    {
        public static void MapReportEndpoints(this IEndpointRouteBuilder app)
        {
            var reporting = app.MapGroup("/report").WithTags("Report");

            reporting.MapPost("aggregate-positions", async (List<Position> positions, IReportService reportService) =>
            {
                var aggregatedPositions = await reportService.CreatePositionReportAsync(positions).ToListAsync();

                return TypedResults.Json(aggregatedPositions, statusCode: StatusCodes.Status200OK);
            })
            .WithName("AggregatePositions")
            .WithDescription("Create a report of positions with aggregated data based on the given quantities");
        }
    }
}
