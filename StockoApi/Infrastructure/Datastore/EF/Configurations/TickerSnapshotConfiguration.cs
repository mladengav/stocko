using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockoApi.Domain;

namespace StockoApi.Infrastructure.Datastore.EF.Configurations
{
    public class TickerSnapshotConfiguration : IEntityTypeConfiguration<TickerSnapshot>
    {
        public void Configure(EntityTypeBuilder<TickerSnapshot> builder)
        {
            builder.HasKey(ts => new { ts.Symbol, ts.SnapshotDate });
            builder.Property(ts => ts.Symbol)
                .IsRequired()
                .HasMaxLength(10);
            builder.Property(ts => ts.SnapshotDate)
                .IsRequired();

            builder.Property(ts => ts.RegularMarketPrice).HasPricePrecision();
            builder.Property(ts => ts.DividendRate).HasPricePrecision();
            builder.Property(ts => ts.TtmDivs).HasPricePrecision();
        }
    }
}
