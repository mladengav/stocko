using StockoApi.Application.Report;
using StockoApi.Domain;

namespace StockoApi.Presentation
{
    public static class ReportEndpoints
    {
        public static void MapReportEndpoints(this IEndpointRouteBuilder app)
        {
            var reporting = app.MapGroup("/report").WithTags("Report");

            reporting.MapPost("aggregate-positions", async (List<Position> positions, IReportService reportService) =>
            {
                var aggregatedPositionsStream = reportService.CreatePositionReportAsync(positions);

                return TypedResults.Ok(aggregatedPositionsStream);
            })
            .WithName("AggregatePositions")
            .WithDescription("Create a report of positions with aggregated data based on the given quantities");
        }
    }
}
