using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using StockoApi.Application;
using StockoApi.Infrastructure.Datastore.Options;

namespace StockoApi.Presentation.Filters
{
    /// <summary>
    /// Endpoint filter that caches the ticker overview response in the keyed
    /// <see cref="IMemoryCache"/> registered under <see cref="CacheServiceKey"/>.
    /// On a hit it short-circuits the pipeline and returns the cached response; on a
    /// miss it invokes the endpoint and caches the result under <see cref="OverviewCacheKey"/>.
    /// </summary>
    public sealed class DatastoreCacheEndpointFilter(
        [FromKeyedServices(DatastoreCacheEndpointFilter.CacheServiceKey)] IMemoryCache cache,
        IOptions<DatastoreOptions> options,
        ILogger<DatastoreCacheEndpointFilter> logger) : IEndpointFilter
    {
        /// <summary>DI service key of the memory cache used by this filter.</summary>
        public const string CacheServiceKey = "DatastoreCache";

        /// <summary>Static cache key under which the full ticker overview is stored.</summary>
        public const string OverviewCacheKey = "alltickers";

        private readonly DatastoreOptions _datastoreOptions = options.Value;

        public async ValueTask<object?> InvokeAsync(
            EndpointFilterInvocationContext context,
            EndpointFilterDelegate next)
        {
            if (cache.TryGetValue(OverviewCacheKey, out var cached))
            {
                // Short-circuit: serve the cached response without invoking the endpoint.
                return cached;
            }

            var result = await next(context);

            CacheResult(result);

            return result;
        }

        private void CacheResult(object? result)
        {
            if (result is null)
            {
                return;
            }

            var size = ResolveSize(result);
            WarnOnCacheOverflow(size);

            var entryOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(_datastoreOptions.CacheSlidingExpirationMinutes),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_datastoreOptions.CacheAbsoluteExpirationMinutes),
                Size = size,
            };

            cache.Set(OverviewCacheKey, result, entryOptions);
        }

        private void WarnOnCacheOverflow(long size)
        {
            if (size > _datastoreOptions.CacheMaxItemCount)
            {
                // The entry exceeds the cache's SizeLimit, so MemoryCache will reject it
                // and every request will keep falling through to the datastore.
                logger.LogWarning(
                    "Overview result of {RecordCount} records exceeds the cache cap of " +
                    "{CacheMaxItemCount}; the response will not be cached.",
                    size, _datastoreOptions.CacheMaxItemCount);
            }
        }

        // The cache SizeLimit counts overview records, so an entry's Size is the number
        // of rows it holds (falling back to 1 when the count can't be determined).
        private static long ResolveSize(object result)
        {
            if (result is IValueHttpResult { Value: IEnumerable<TickerOverviewRecord> records })
            {
                return records.Count();
            }

            return 1;
        }
    }
}
