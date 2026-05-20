using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;

namespace StockoApi
{
    public class CsvDatastoreService : IDatastoreService
    {
        private const string TickersFileName = "tickers.csv";
        private const string AggregationsSubdir = "aggregations";
        private const string TtmIncomeFileName = "ttm_income.csv";
        private const string LastDividendDecreaseFileName = "last_dividend_decrease.csv";
        private const string YearsSinceDividendDecreaseFileName = "years_since_dividend_decrease.csv";
        private const string YearsConsecutiveDividendIncreaseFileName = "years_consecutive_dividend_increase.csv";

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
            var aggregationsDir = Path.Combine(_cacheFolder, AggregationsSubdir);
            var ttmBySymbol = await ReadTtmDividendsAsync(
                Path.Combine(aggregationsDir, TtmIncomeFileName));
            var lastDecreaseBySymbol = await ReadLastDividendDecreaseAsync(
                Path.Combine(aggregationsDir, LastDividendDecreaseFileName));
            var yearsSinceDecreaseBySymbol = await ReadYearsSinceDividendDecreaseAsync(
                Path.Combine(aggregationsDir, YearsSinceDividendDecreaseFileName));
            var consecutiveIncreaseBySymbol = await ReadYearsConsecutiveDividendIncreaseAsync(
                Path.Combine(aggregationsDir, YearsConsecutiveDividendIncreaseFileName));
            var records = await ReadTickersAsync(
                Path.Combine(_cacheFolder, TickersFileName),
                ttmBySymbol,
                lastDecreaseBySymbol,
                yearsSinceDecreaseBySymbol,
                consecutiveIncreaseBySymbol);
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

        private static async Task<IReadOnlyDictionary<string, DateOnly>> ReadLastDividendDecreaseAsync(string path)
        {
            var result = new Dictionary<string, DateOnly>(StringComparer.OrdinalIgnoreCase);
            if (!File.Exists(path))
            {
                return result;
            }

            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, CreateConfig());
            csv.Context.RegisterClassMap<LastDividendDecreaseRowMap>();
            TreatEmptyCellsAsNull(csv);

            await foreach (var row in csv.GetRecordsAsync<LastDividendDecreaseRow>())
            {
                if (string.IsNullOrWhiteSpace(row.Symbol))
                {
                    continue;
                }
                result[row.Symbol.Trim()] = row.LastDividendDecrease;
            }

            return result;
        }

        private static async Task<IReadOnlyDictionary<string, int>> ReadYearsSinceDividendDecreaseAsync(string path)
        {
            var result = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            if (!File.Exists(path))
            {
                return result;
            }

            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, CreateConfig());
            csv.Context.RegisterClassMap<YearsSinceDividendDecreaseRowMap>();
            TreatEmptyCellsAsNull(csv);

            await foreach (var row in csv.GetRecordsAsync<YearsSinceDividendDecreaseRow>())
            {
                if (string.IsNullOrWhiteSpace(row.Symbol))
                {
                    continue;
                }
                result[row.Symbol.Trim()] = row.YearsSinceDividendDecrease;
            }

            return result;
        }

        private static async Task<IReadOnlyDictionary<string, int>> ReadYearsConsecutiveDividendIncreaseAsync(string path)
        {
            var result = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            if (!File.Exists(path))
            {
                return result;
            }

            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, CreateConfig());
            csv.Context.RegisterClassMap<YearsConsecutiveDividendIncreaseRowMap>();
            TreatEmptyCellsAsNull(csv);

            await foreach (var row in csv.GetRecordsAsync<YearsConsecutiveDividendIncreaseRow>())
            {
                if (string.IsNullOrWhiteSpace(row.Symbol))
                {
                    continue;
                }
                result[row.Symbol.Trim()] = row.YearsConsecutiveDividendIncrease;
            }

            return result;
        }

        private static async Task<List<TickerOverviewRecord>> ReadTickersAsync(
            string path,
            IReadOnlyDictionary<string, decimal> ttmBySymbol,
            IReadOnlyDictionary<string, DateOnly> lastDecreaseBySymbol,
            IReadOnlyDictionary<string, int> yearsSinceDecreaseBySymbol,
            IReadOnlyDictionary<string, int> consecutiveIncreaseBySymbol)
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
                var lastDecrease = lastDecreaseBySymbol.TryGetValue(row.Symbol, out var ld)
                    ? ld
                    : default(DateOnly);
                var yearsSinceDecrease = yearsSinceDecreaseBySymbol.TryGetValue(row.Symbol, out var ysd)
                    ? ysd
                    : 0;
                var consecutiveIncrease = consecutiveIncreaseBySymbol.TryGetValue(row.Symbol, out var yci)
                    ? yci
                    : 0;

                records.Add(new TickerOverviewRecord(
                    SnapshotDate: row.SnapshotDate,
                    Symbol: row.Symbol,
                    SectorKey: row.SectorKey ?? string.Empty,
                    IndustryKey: row.IndustryKey ?? string.Empty,
                    Industry: row.Industry ?? string.Empty,
                    Sector: row.Sector ?? string.Empty,
                    ExDividendDate: row.ExDividendDate,
                    LastDividendDate: row.LastDividendDate,
                    LongName: row.LongName ?? string.Empty,
                    RegularMarketPrice: row.RegularMarketPrice,
                    RegularMarketTime: row.RegularMarketTime,
                    DividendRate: row.DividendRate,
                    DividendYield: row.DividendYield,
                    MarketCap: row.MarketCap,
                    PayoutRatio: row.PayoutRatio,
                    HeldPercentInsiders: row.HeldPercentInsiders,
                    HeldPercentInstitutions: row.HeldPercentInstitutions,
                    QuoteType: row.QuoteType ?? string.Empty,
                    TypeDisp: row.TypeDisp ?? string.Empty,
                    LastDividendDecrease: lastDecrease,
                    YearsSinceDividendDecrease: yearsSinceDecrease,
                    YearsConsecutiveDividendIncrease: consecutiveIncrease,
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
            public string? Industry { get; set; }
            public string? Sector { get; set; }
            public DateOnly ExDividendDate { get; set; }
            public DateOnly LastDividendDate { get; set; }
            public string? LongName { get; set; }
            public decimal RegularMarketPrice { get; set; }
            public long RegularMarketTime { get; set; }
            public decimal DividendRate { get; set; }
            public double DividendYield { get; set; }
            public long MarketCap { get; set; }
            public double PayoutRatio { get; set; }
            public double HeldPercentInsiders { get; set; }
            public double HeldPercentInstitutions { get; set; }
            public string? QuoteType { get; set; }
            public string? TypeDisp { get; set; }
        }

        private sealed class TickerRowMap : ClassMap<TickerRow>
        {
            public TickerRowMap()
            {
                Map(r => r.SnapshotDate).Default(default(DateOnly));
                Map(r => r.Symbol).Default(string.Empty);
                Map(r => r.SectorKey).Default(string.Empty);
                Map(r => r.IndustryKey).Default(string.Empty);
                Map(r => r.Industry).Default(string.Empty);
                Map(r => r.Sector).Default(string.Empty);
                Map(r => r.ExDividendDate)
                    .TypeConverter<EpochOrDateOnlyConverter>()
                    .Default(default(DateOnly));
                Map(r => r.LastDividendDate)
                    .TypeConverter<EpochOrDateOnlyConverter>()
                    .Default(default(DateOnly));
                Map(r => r.LongName).Default(string.Empty);
                Map(r => r.RegularMarketPrice).Default(0m);
                Map(r => r.RegularMarketTime).Default(0L);
                Map(r => r.DividendRate).Default(0m);
                Map(r => r.DividendYield).Default(0d);
                Map(r => r.MarketCap).Default(0L);
                Map(r => r.PayoutRatio).Default(0d);
                Map(r => r.HeldPercentInsiders).Default(0d);
                Map(r => r.HeldPercentInstitutions).Default(0d);
                Map(r => r.QuoteType).Default(string.Empty);
                Map(r => r.TypeDisp).Default(string.Empty);
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

        private sealed class LastDividendDecreaseRow
        {
            public string Symbol { get; set; } = string.Empty;
            public DateOnly LastDividendDecrease { get; set; }
        }

        private sealed class LastDividendDecreaseRowMap : ClassMap<LastDividendDecreaseRow>
        {
            public LastDividendDecreaseRowMap()
            {
                Map(r => r.Symbol).Name("Symbol", "ticker").Default(string.Empty);
                Map(r => r.LastDividendDecrease)
                    .Name("LastDividendDecrease", "last_dividend_decrease")
                    .TypeConverter<EpochOrDateOnlyConverter>()
                    .Default(default(DateOnly));
            }
        }

        private sealed class YearsSinceDividendDecreaseRow
        {
            public string Symbol { get; set; } = string.Empty;
            public int YearsSinceDividendDecrease { get; set; }
        }

        private sealed class YearsSinceDividendDecreaseRowMap : ClassMap<YearsSinceDividendDecreaseRow>
        {
            public YearsSinceDividendDecreaseRowMap()
            {
                Map(r => r.Symbol).Name("Symbol", "ticker").Default(string.Empty);
                Map(r => r.YearsSinceDividendDecrease)
                    .Name("YearsSinceDividendDecrease", "years_since_dividend_decrease")
                    .Default(0);
            }
        }

        private sealed class YearsConsecutiveDividendIncreaseRow
        {
            public string Symbol { get; set; } = string.Empty;
            public int YearsConsecutiveDividendIncrease { get; set; }
        }

        private sealed class YearsConsecutiveDividendIncreaseRowMap : ClassMap<YearsConsecutiveDividendIncreaseRow>
        {
            public YearsConsecutiveDividendIncreaseRowMap()
            {
                Map(r => r.Symbol).Name("Symbol", "ticker").Default(string.Empty);
                Map(r => r.YearsConsecutiveDividendIncrease)
                    .Name("YearsConsecutiveDividendIncrease", "years_consecutive_dividend_increase")
                    .Default(0);
            }
        }

        // tickers.csv stores date fields as Unix-epoch seconds or ISO dates; accept
        // either and fall back to default(DateOnly).
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
