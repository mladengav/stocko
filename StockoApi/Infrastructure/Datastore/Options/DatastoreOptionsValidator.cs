using Microsoft.Extensions.Options;

namespace StockoApi.Infrastructure.Datastore.Options
{
    /// <summary>
    /// Validates <see cref="DatastoreOptions"/> at application startup.
    /// </summary>
    public sealed class DatastoreOptionsValidator
        : IValidateOptions<DatastoreOptions>
    {
        public ValidateOptionsResult Validate(string? name, DatastoreOptions options)
        {
            var errors = new List<string>();

            if (options.DatastoreType == DatastoreType.None)
                return ValidateOptionsResult.Fail(
                        $"Unsupported DatastoreType '{options.DatastoreType}'. " +
                        $"Expected one of: {string.Join(", ",
                            Enum.GetNames<DatastoreType>()
                            .Where(typeName => typeName != DatastoreType.None.ToString()))}.");

            ValidateCsvCacheFolder(options, errors);

            if (options.DatastoreType == DatastoreType.AzureBlobCsv)
            {
                ValidateAzureOptions(options, errors);
            }

            return errors.Count == 0
                ? ValidateOptionsResult.Success
                : ValidateOptionsResult.Fail(errors);
        }

        private static void ValidateCsvCacheFolder(
            DatastoreOptions options, List<string> errors)
        {
            if (string.IsNullOrWhiteSpace(options.CsvCacheFolder))
            {
                errors.Add(
                    $"{nameof(options.CsvCacheFolder)} is required and must not be empty " +
                    $"(DatastoreType = {options.DatastoreType}).");
                return;
            }

            // Verify the value is a syntactically valid path on the current OS.
            // Path.GetFullPath throws ArgumentException for paths that contain
            // invalid characters or are otherwise un-routable.
            try
            {
                Path.GetFullPath(options.CsvCacheFolder);
            }
            catch (Exception ex) when (ex is ArgumentException or NotSupportedException)
            {
                errors.Add(
                    $"{nameof(options.CsvCacheFolder)} '{options.CsvCacheFolder}' " +
                    $"is not a valid file-system path: {ex.Message}");
            }
        }

        private static void ValidateAzureOptions(
            DatastoreOptions options, List<string> errors)
        {
            RequireNonWhiteSpace(options.AzureStorageBlobUrl,
                nameof(options.AzureStorageBlobUrl), errors);

            RequireNonWhiteSpace(options.AzureClientId,
                nameof(options.AzureClientId), errors);

            RequireNonWhiteSpace(options.AzureTenantId,
                nameof(options.AzureTenantId), errors);

            RequireNonWhiteSpace(options.AzureClientSecret,
                nameof(options.AzureClientSecret), errors);
        }

        private static void RequireNonWhiteSpace(
            string? value, string propertyName, List<string> errors)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                errors.Add(
                    $"{propertyName} is required and must not be empty " +
                    $"when DatastoreType is {DatastoreType.AzureBlobCsv}.");
            }
        }
    }
}