using StockoApi.Domain;

namespace StockoApi.Application.Report
{
    public interface IReportService
    {
        public IAsyncEnumerable<PositionSnapshot> CreatePositionReportAsync(IEnumerable<Position> positions);
    }
}
