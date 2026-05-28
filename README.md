# stocko
Stocko POC


Example usage (Powershell):
Build the Docker image:
```
docker build docker build . -f .\StockoApi\Dockerfile -t stocko:local
```

For local deployments, simple HTTP access:
```
docker run -p 15555:8080 -e ASPNETCORE_ENVIRONMENT=Development stocko:local 
```

For remotely accessible deployments, HTTPS with a valid certificate should be used.  Below example shows a dev certificate for illustration only.
```
dotnet dev-certs https -ep .\cert.pfx -p mycertpass --trust

docker run -p 15556:15556 `
  -v .\cert.pfx:/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Path=/home/app/.aspnet/https/cert.pfx `
  -e ASPNETCORE_Kestrel__Certificates__Default__Password="mycertpass" `
  -e ASPNETCORE_HTTPS_PORTS=15556 `
  stocko:local 
```