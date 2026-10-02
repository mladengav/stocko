using Microsoft.EntityFrameworkCore;
using StockoApi.Application.Datastore;
using StockoApi.Domain;

namespace StockoApi.Infrastructure.Datastore.EF
{
    public class EfDatastoreService(StockoDbContext dbContext) : IDatastoreService
    {
        public async Task<IEnumerable<TickerSnapshot>> GetOverviewAsync()
        {
            return await dbContext.TickerSnapshots
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
