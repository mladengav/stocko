# stocko
Stocko POC


Example usage (Powershell):
```
dotnet dev-certs https -ep .\cert.pfx -p mycertpass --trust

docker build docker build . -f .\StockoApi\Dockerfile -t stocko:local

docker run -p 15556:15556 `
  -v .\cert.pfx:/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Path=/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Password="mycertpass" `
  -e ASPNETCORE_HTTPS_PORTS=15556 `
  stocko:local 