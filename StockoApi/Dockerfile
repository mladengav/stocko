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
WORKDIR "/src/stockoui"
RUN npm install
RUN npm run build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/StockoApi"
RUN dotnet publish "./StockoApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build /src/stockoui/dist ./wwwroot
# Copy the published cache folder into /srv/stocko/cache and ensure the runtime can read/write it.
WORKDIR /srv/stocko
COPY --chown=$APP_UID:$APP_UID --chmod=0777 --from=publish /app/publish/cache ./cache

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_HTTPS_PORTS=8081

WORKDIR /app
ENTRYPOINT ["dotnet", "StockoApi.dll"]