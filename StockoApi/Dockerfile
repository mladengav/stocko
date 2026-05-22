# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash
RUN apt-get -y install nodejs


FROM with-node AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["StockoApi/StockoApi.csproj", "StockoApi/"]
COPY ["stockoui/stockoui.esproj", "stockoui/"]
RUN dotnet restore "./StockoApi/StockoApi.csproj"
COPY . .
WORKDIR "/src/StockoApi"
RUN dotnet build "./StockoApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./StockoApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Copy the published cache folder into /srv/stocko/cache and ensure the runtime can read/write it.
RUN mkdir -p /srv/stocko \
 && if [ -d /app/cache ]; then cp -a /app/cache /srv/stocko/; fi \
 && chown -R $APP_UID:$APP_GID /srv/stocko/cache 2>/dev/null || true \
 && chmod -R 0777 /srv/stocko/cache
ENTRYPOINT ["dotnet", "StockoApi.dll"]