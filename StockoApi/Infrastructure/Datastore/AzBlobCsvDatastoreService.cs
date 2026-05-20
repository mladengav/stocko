using Azure.Core;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using StockoApi.Application;

namespace StockoApi.Infrastructure.Datastore
{
    /// <summary>
    /// A <see cref="CsvDatastoreService"/> that mirrors a "csvcache" Azure Blob
    /// container into the local cache folder. An initial sync runs at startup and
    /// a background timer periodically re-checks every blob's LastModified to pull
    /// down any updates. Read-only — no write paths back to Azure.
    /// </summary>
    public sealed class AzBlobCsvDatastoreService : CsvDatastoreService, IDisposable
    {
        private const string ContainerName = "csvcache";
        private const string BlobUrlKey = "AZURE_STORAGE_BLOB_URL";
        private const string ClientIdKey = "AZURE_CLIENT_ID";
        private const string TenantIdKey = "AZURE_TENANT_ID";
        private const string ClientSecretKey = "AZURE_CLIENT_SECRET";
        private const string RefreshSecondsKey = "AZURE_STORAGE_BLOB_REFRESH_SECONDS";
        private const int DefaultRefreshSeconds = 30;

        private readonly BlobContainerClient _container;
        private readonly ILogger<AzBlobCsvDatastoreService> _logger;
        private readonly CancellationTokenSource _shutdownCts = new();
        private readonly SemaphoreSlim _syncLock = new(1, 1);
        private readonly Task _initialSyncTask;
        private readonly Task _refreshLoopTask;
        private bool _disposed;

        public AzBlobCsvDatastoreService(
            IWebHostEnvironment env,
            IConfiguration config,
            ILogger<AzBlobCsvDatastoreService> logger)
            : base(env)
        {
            _logger = logger;
            Directory.CreateDirectory(CacheFolder);

            var storageUrl = config[BlobUrlKey];
            if (string.IsNullOrWhiteSpace(storageUrl))
            {
                throw new InvalidOperationException(
                    $"Configuration value '{BlobUrlKey}' is required for {nameof(AzBlobCsvDatastoreService)}.");
            }

            _container = new BlobServiceClient(new Uri(storageUrl), BuildCredential(config))
                .GetBlobContainerClient(ContainerName);

            // Kick off the initial sync as a background task so DI construction stays fast.
            // GetOverviewAsync awaits this task on every call, but it's a cheap check once complete.
            // The initial sync ignores local timestamps and overwrites every blob, so the cache
            // always starts from a known-good copy of Azure.
            _initialSyncTask = Task.Run(() => SafeSyncAsync(_shutdownCts.Token, "initial sync", forceAll: true));

            var interval = TimeSpan.FromSeconds(ResolveRefreshSeconds(config));
            _refreshLoopTask = RunRefreshLoopAsync(interval, _shutdownCts.Token);
        }

        public override async Task<IEnumerable<TickerOverviewRecord>> GetOverviewAsync()
        {
            if (!_initialSyncTask.IsCompleted)
            {
                await _initialSyncTask;
            }
            return await base.GetOverviewAsync();
        }

        private static TokenCredential BuildCredential(IConfiguration config)
        {
            var clientId = config[ClientIdKey];
            var tenantId = config[TenantIdKey];
            var clientSecret = config[ClientSecretKey];

            if (!string.IsNullOrWhiteSpace(clientId)
                && !string.IsNullOrWhiteSpace(tenantId)
                && !string.IsNullOrWhiteSpace(clientSecret))
            {
                return new ClientSecretCredential(tenantId, clientId, clientSecret);
            }

            // Fall back to DefaultAzureCredential (managed identity, Azure CLI, VS, etc.).
            return new DefaultAzureCredential();
        }

        private static int ResolveRefreshSeconds(IConfiguration config)
        {
            var raw = config[RefreshSecondsKey];
            if (!string.IsNullOrWhiteSpace(raw)
                && int.TryParse(raw, out var seconds)
                && seconds > 0)
            {
                return seconds;
            }
            return DefaultRefreshSeconds;
        }

        private async Task RunRefreshLoopAsync(TimeSpan interval, CancellationToken ct)
        {
            using var timer = new PeriodicTimer(interval);
            try
            {
                while (await timer.WaitForNextTickAsync(ct))
                {
                    await SafeSyncAsync(ct, "background refresh", forceAll: false);
                }
            }
            catch (OperationCanceledException)
            {
                // Expected on shutdown.
            }
        }

        private async Task SafeSyncAsync(CancellationToken ct, string context, bool forceAll)
        {
            try
            {
                await SyncFromAzureAsync(ct, forceAll);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Azure Blob {Context} from container '{Container}' failed; serving local cache.",
                    context, ContainerName);
            }
        }

        private async Task SyncFromAzureAsync(CancellationToken ct, bool forceAll)
        {
            await _syncLock.WaitAsync(ct);
            try
            {
                await foreach (var blob in _container.GetBlobsAsync(cancellationToken: ct))
                {
                    ct.ThrowIfCancellationRequested();
                    await DownloadAsync(blob, ct, forceAll);
                }
            }
            finally
            {
                _syncLock.Release();
            }
        }

        private async Task DownloadAsync(BlobItem blob, CancellationToken ct, bool forceAll)
        {
            var relative = blob.Name.Replace('/', Path.DirectorySeparatorChar);
            var targetPath = Path.Combine(CacheFolder, relative);
            var targetDir = Path.GetDirectoryName(targetPath);
            if (!string.IsNullOrEmpty(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            var remoteUtc = blob.Properties.LastModified?.UtcDateTime;
            if (!forceAll && File.Exists(targetPath) && remoteUtc is { } rUtc)
            {
                // We pin local LastWriteTimeUtc to the blob's LastModified after each
                // download, so this comparison is stable across restarts.
                if (File.GetLastWriteTimeUtc(targetPath) >= rUtc)
                {
                    return;
                }
            }

            var tempPath = targetPath + ".part";
            var blobClient = _container.GetBlobClient(blob.Name);
            try
            {
                await using (var output = new FileStream(
                    tempPath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await blobClient.DownloadToAsync(output, ct);
                }

                if (remoteUtc is { } rUtc2)
                {
                    File.SetLastWriteTimeUtc(tempPath, rUtc2);
                }

                File.Move(tempPath, targetPath, overwrite: true);

                _logger.LogInformation(
                    "Synced blob '{Blob}' to '{Target}'.", blob.Name, targetPath);
            }
            catch
            {
                TryDelete(tempPath);
                throw;
            }
        }

        private static void TryDelete(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
            catch
            {
                // Best-effort cleanup.
            }
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }
            _disposed = true;

            try
            {
                _shutdownCts.Cancel();
            }
            catch (ObjectDisposedException)
            {
            }

            try
            {
                // Give the loops a moment to unwind before disposing their dependencies.
                Task.WhenAll(_initialSyncTask, _refreshLoopTask).Wait(TimeSpan.FromSeconds(2));
            }
            catch
            {
                // Swallow shutdown exceptions.
            }

            _shutdownCts.Dispose();
            _syncLock.Dispose();
        }
    }
}
