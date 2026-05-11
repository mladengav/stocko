namespace StockoApi
{
    public interface IDatastoreService
    {
        public Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync();
    }

    public record TickerOverviewRecord(string Symbol, decimal TtmDivs, decimal LastDiv);
    
    public class TestDatastoreService : IDatastoreService
    {
        public async Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync()
        {
            var records = new List<TickerOverviewRecord>
            {
                new("BNS.TO", 0.88m, 0.22m),
                new("TD.TO", 1.56m, 0.39m)
            };

            return records.AsEnumerable();
        }
}

}
