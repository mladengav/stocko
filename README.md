# Stocko

Stocko is a dividend-stock analysis app. It surfaces dividend history, per-ticker
overviews, and position reports computed from CSV data.

## Overview

Stocko is built as two cooperating projects that are composed into a single deployable
Docker image:

- **Back end** — a .NET 10 ASP.NET Core Minimal API (`StockoApi/`) following Clean
  Architecture. It exposes the JSON API and serves the front-end static assets.
- **Front end** — a Vite + React 19 + TypeScript single-page app (`stockoui/`) using MUI.
  At image build time the production `dist/` bundle is copied into the API's `wwwroot`,
  so one container serves both the API and the UI.
- **Datastore** — the data layer reads CSV files (tickers, dividend history, precomputed
  aggregations). The backing store is runtime-configurable: either a **local cache folder**
  (`Csv`) or **Azure Blob Storage** (`AzureBlobCsv`).

```
┌─────────────────────────────────────────────┐
│              Stocko container                │
│                                              │
│   React UI (wwwroot)  ◄──  ASP.NET Core API  │
│                                  │           │
└──────────────────────────────────┼──────────┘
                                    ▼
                    Datastore: local CSV cache
                       or Azure Blob Storage
```

The datastore is selected by the `Stocko:Datastore:DatastoreType` configuration value
(`Csv` or `AzureBlobCsv`) and reads from the folder given by `CsvCacheFolder`. The image
ships with sample CSV data at `/srv/stocko/cache`, which is the default cache folder in
the Production environment.

## Getting Started

The simplest way to run Stocko is via Docker. All examples below are PowerShell; for
Bash, replace the trailing `` ` `` line-continuation character with `\` (and use
Unix-style host paths in volume mounts).

### Build the image

```powershell
docker build . -f .\StockoApi\Dockerfile -t stocko:local
```

### Run (local, plain HTTP)

Good for local use. The container serves both the API and the UI on port 8080, using the
sample CSV data baked into the image.

```powershell
docker run -p 15555:8080 -e ASPNETCORE_ENVIRONMENT=Development stocko:local
```

Then browse to <http://localhost:15555>.

### Run (HTTPS with a certificate)

For remotely accessible deployments, use HTTPS with a valid certificate. The example below
uses a **dev certificate for illustration only** — replace it with a real certificate for
any real deployment.

```powershell
dotnet dev-certs https -ep .\cert.pfx -p mycertpass --trust

docker run -p 15556:15556 `
  -v .\cert.pfx:/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Path=/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Password="mycertpass" `
  -e ASPNETCORE_HTTPS_PORTS=15556 `
  stocko:local
```

## Serving Your Own Data

### Use a local cache folder (mounted volume)

To serve your own CSV data instead of the sample data baked into the image, mount a host
folder into the container at `/srv/stocko/cache` — the default cache folder used by the
`Csv` datastore in the Production environment. Your host folder should contain the same CSV
layout as the sample `cache/` folder.

```powershell
docker run -p 15555:8080 `
  -v C:\data\stocko-cache:/srv/stocko/cache `
  stocko:local
```

To mount the data at a different path, point `CsvCacheFolder` at it explicitly:

```powershell
docker run -p 15555:8080 `
  -v C:\data\stocko-cache:/data/cache `
  -e Stocko__Datastore__DatastoreType=Csv `
  -e Stocko__Datastore__CsvCacheFolder=/data/cache `
  stocko:local
```

### Connect to Azure Blob Storage

To read CSV data from Azure Blob Storage instead of a local folder, switch the datastore
type to `AzureBlobCsv` and supply the storage account URL plus service-principal
credentials via environment variables. (Configuration keys are nested under
`Stocko:Datastore`, so use the ASP.NET Core `__` separator on the command line.)

```powershell
docker run -p 15555:8080 `
  -e Stocko__Datastore__DatastoreType=AzureBlobCsv `
  -e Stocko__Datastore__AzureStorageBlobUrl=https://<account>.blob.core.windows.net `
  -e Stocko__Datastore__AzureTenantId=<tenant-id> `
  -e Stocko__Datastore__AzureClientId=<client-id> `
  -e Stocko__Datastore__AzureClientSecret=<client-secret> `
  stocko:local
```

The CSV files are downloaded into the local cache folder (`CsvCacheFolder`, default
`/srv/stocko/cache`) and served from there.

## API Documentation (Development only)

When running with `ASPNETCORE_ENVIRONMENT=Development`:

- OpenAPI spec: `/openapi/v1.json`
- Scalar UI: `/scalar/v1`

## Building from Source

Open in Visual Studio and click "Start", or try:

```powershell
dotnet build Stocko.slnx        # build API + tests
dotnet run --project StockoApi  # run the API (auto-launches the React dev server)
dotnet test                     # run unit tests
```
