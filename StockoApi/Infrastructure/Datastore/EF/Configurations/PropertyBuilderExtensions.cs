using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace StockoApi.Infrastructure.Datastore.EF.Configurations
{
    internal static class PropertyBuilderExtensions
    {
        public static PropertyBuilder<decimal> HasPricePrecision(this PropertyBuilder<decimal> propertyBuilder)
            => propertyBuilder.HasPrecision(19, 4);
    }
}
