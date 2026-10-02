using Microsoft.EntityFrameworkCore;
using StockoApi.Domain;

namespace StockoApi.Infrastructure.Datastore.EF
{
    public class StockoDbContext(DbContextOptions<StockoDbContext> options) : DbContext(options) 
    {
        public DbSet<TickerSnapshot> TickerSnapshots => Set<TickerSnapshot>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("stocko");

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(StockoDbContext).Assembly);
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            base.ConfigureConventions(configurationBuilder);

            configurationBuilder.Properties<string>().HaveMaxLength(255);
        }
    }
}
