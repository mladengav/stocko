using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
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
    public sealed class DatastoreCacheEndpointFilter : IEndpointFilter
    {
        /// <summary>DI service key of the memory cache used by this filter.</summary>
        public const string CacheServiceKey = "DatastoreCache";

        /// <summary>Static cache key under which the full ticker overview is stored.</summary>
        public const string OverviewCacheKey = "alltickers";

        private readonly IMemoryCache _cache;
        private readonly DatastoreOptions _options;
        private readonly ILogger<DatastoreCacheEndpointFilter> _logger;

        public DatastoreCacheEndpointFilter(
            [FromKeyedServices(CacheServiceKey)] IMemoryCache cache,
            IOptions<DatastoreOptions> options,
            ILogger<DatastoreCacheEndpointFilter> logger)
        {
            _cache = cache;
            _options = options.Value;
            _logger = logger;
        }

        public async ValueTask<object?> InvokeAsync(
            EndpointFilterInvocationContext context,
            EndpointFilterDelegate next)
        {
            if (_cache.TryGetValue(OverviewCacheKey, out var cached))
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
            if (size > _options.CacheMaxItemCount)
            {
                // The entry exceeds the cache's SizeLimit, so MemoryCache will reject it
                // and every request will keep falling through to the datastore.
                _logger.LogWarning(
                    "Overview result of {RecordCount} records exceeds the cache cap of " +
                    "{CacheMaxItemCount}; the response will not be cached.",
                    size, _options.CacheMaxItemCount);
            }

            var entryOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(_options.CacheSlidingExpirationMinutes),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_options.CacheAbsoluteExpirationMinutes),
                Size = size,
            };

            _cache.Set(OverviewCacheKey, result, entryOptions);
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
