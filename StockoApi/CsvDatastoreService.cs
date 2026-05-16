using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;

namespace StockoApi
{
    public class CsvDatastoreService : IDatastoreService
    {
        private const string TickersFileName = "tickers.csv";
        private const string TtmIncomeFileName = "ttm_income.csv";

        private readonly string _cacheFolder;

        protected string CacheFolder => _cacheFolder;

        public CsvDatastoreService(IWebHostEnvironment env)
            : this(ResolveCacheFolder(env.ContentRootPath))
        {
        }

        public CsvDatastoreService(string cacheFolder)
        {
            _cacheFolder = cacheFolder;
        }

        public virtual async Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync()
        {
            var ttmBySymbol = await ReadTtmDividendsAsync(Path.Combine(_cacheFolder, TtmIncomeFileName));
            var records = await ReadTickersAsync(Path.Combine(_cacheFolder, TickersFileName), ttmBySymbol);
            return records;
        }

        private static async Task<IReadOnlyDictionary<string, decimal>> ReadTtmDividendsAsync(string path)
        {
            var result = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
            if (!File.Exists(path))
            {
                return result;
            }

            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, CreateConfig());
            csv.Context.RegisterClassMap<TtmIncomeRowMap>();
            TreatEmptyCellsAsNull(csv);

            await foreach (var row in csv.GetRecordsAsync<TtmIncomeRow>())
            {
                if (string.IsNullOrWhiteSpace(row.Symbol))
                {
                    continue;
                }
                result[row.Symbol.Trim()] = row.TtmDivs;
            }

            return result;
        }

        private static async Task<List<TickerOverviewRecord>> ReadTickersAsync(
            string path,
            IReadOnlyDictionary<string, decimal> ttmBySymbol)
        {
            var records = new List<TickerOverviewRecord>();
            if (!File.Exists(path))
            {
                return records;
            }

            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, CreateConfig());
            csv.Context.RegisterClassMap<TickerRowMap>();
            TreatEmptyCellsAsNull(csv);

            var rowNumber = 1;
            await foreach (var row in csv.GetRecordsAsync<TickerRow>())
            {
                rowNumber++;
                if (string.IsNullOrWhiteSpace(row.Symbol))
                {
                    throw new InvalidDataException(
                        $"Symbol is required but was blank or missing in row {rowNumber} of '{path}'.");
                }

                var ttm = ttmBySymbol.TryGetValue(row.Symbol, out var t) ? t : 0m;

                records.Add(new TickerOverviewRecord(
                    SnapshotDate: row.SnapshotDate,
                    Symbol: row.Symbol,
                    SectorKey: row.SectorKey ?? string.Empty,
                    IndustryKey: row.IndustryKey ?? string.Empty,
                    ExDividendDateUtc: row.ExDividendDateUtc,
                    LongName: row.LongName ?? string.Empty,
                    CurrentPrice: row.CurrentPrice,
                    DividendRate: row.DividendRate,
                    DividendYield: row.DividendYield,
                    MarketCap: row.MarketCap,
                    PayoutRatio: row.PayoutRatio,
                    TtmDivs: ttm));
            }

            return records;
        }

        // Case-insensitive header matching, ignore unknown/missing columns, swallow
        // bad cells so a single bad row doesn't fail the whole file. Type-level
        // defaults are applied per ClassMap below.
        private static CsvConfiguration CreateConfig() => new(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header?.Trim().ToLowerInvariant() ?? string.Empty,
            HeaderValidated = null,
            MissingFieldFound = null,
            BadDataFound = null,
            TrimOptions = TrimOptions.Trim,
        };

        // Treat an empty cell as null so the per-member .Default(...) is applied
        // instead of CsvHelper throwing a TypeConverterException for value types.
        private static void TreatEmptyCellsAsNull(CsvReader csv)
        {
            var cache = csv.Context.TypeConverterOptionsCache;
            Type[] valueTypes =
            [
                typeof(decimal), typeof(double), typeof(float),
                typeof(long), typeof(int), typeof(short),
                typeof(DateOnly), typeof(DateTime), typeof(bool),
            ];
            foreach (var t in valueTypes)
            {
                var options = cache.GetOptions(t);
                if (!options.NullValues.Contains(string.Empty))
                {
                    options.NullValues.Add(string.Empty);
                }
            }
        }

        // Probe likely locations so the service works whether the app is launched from
        // the project root (dev) or the publish output (production), regardless of cwd.
        private static string ResolveCacheFolder(string contentRoot)
        {
            var fromContentRoot = Path.Combine(contentRoot, "cache");
            if (Directory.Exists(fromContentRoot))
            {
                return fromContentRoot;
            }

            var fromBaseDir = Path.Combine(AppContext.BaseDirectory, "cache");
            if (Directory.Exists(fromBaseDir))
            {
                return fromBaseDir;
            }

            return fromContentRoot;
        }

        private sealed class TickerRow
        {
            public DateOnly SnapshotDate { get; set; }
            public string Symbol { get; set; } = string.Empty;
            public string? SectorKey { get; set; }
            public string? IndustryKey { get; set; }
            public DateOnly ExDividendDateUtc { get; set; }
            public string? LongName { get; set; }
            public decimal CurrentPrice { get; set; }
            public decimal DividendRate { get; set; }
            public double DividendYield { get; set; }
            public long MarketCap { get; set; }
            public double PayoutRatio { get; set; }
        }

        private sealed class TickerRowMap : ClassMap<TickerRow>
        {
            public TickerRowMap()
            {
                Map(r => r.SnapshotDate).Default(default(DateOnly));
                Map(r => r.Symbol).Default(string.Empty);
                Map(r => r.SectorKey).Default(string.Empty);
                Map(r => r.IndustryKey).Default(string.Empty);
                Map(r => r.ExDividendDateUtc)
                    .Name("ExDividendDateUtc", "exDividendDate")
                    .TypeConverter<EpochOrDateOnlyConverter>()
                    .Default(default(DateOnly));
                Map(r => r.LongName).Default(string.Empty);
                Map(r => r.CurrentPrice).Default(0m);
                Map(r => r.DividendRate).Default(0m);
                Map(r => r.DividendYield).Default(0d);
                Map(r => r.MarketCap).Default(0L);
                Map(r => r.PayoutRatio).Default(0d);
            }
        }

        private sealed class TtmIncomeRow
        {
            public string Symbol { get; set; } = string.Empty;
            public decimal TtmDivs { get; set; }
        }

        private sealed class TtmIncomeRowMap : ClassMap<TtmIncomeRow>
        {
            public TtmIncomeRowMap()
            {
                Map(r => r.Symbol).Name("Symbol", "ticker").Default(string.Empty);
                Map(r => r.TtmDivs).Name("TtmDivs", "ttm_dividend").Default(0m);
            }
        }

        // tickers.csv stores exDividendDate as a Unix-epoch seconds value; accept
        // either that or a parseable date string and fall back to default(DateOnly).
        private sealed class EpochOrDateOnlyConverter : DefaultTypeConverter
        {
            public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
            {
                if (string.IsNullOrWhiteSpace(text))
                {
                    return default(DateOnly);
                }

                var trimmed = text.Trim();
                if (DateOnly.TryParse(trimmed, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    return date;
                }

                if (long.TryParse(trimmed, NumberStyles.Any, CultureInfo.InvariantCulture, out var unix))
                {
                    return DateOnly.FromDateTime(DateTimeOffset.FromUnixTimeSeconds(unix).UtcDateTime);
                }

                return default(DateOnly);
            }
        }
    }
}
