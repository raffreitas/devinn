FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/DevInn.Backup/DevInn.Backup.csproj", "src/DevInn.Backup/"]
RUN dotnet restore "src/DevInn.Backup/DevInn.Backup.csproj"

COPY . .
RUN dotnet publish "src/DevInn.Backup/DevInn.Backup.csproj" \
    --configuration Release \
    --runtime linux-x64 \
    --self-contained true \
    --output /app/publish \
    /p:PublishSingleFile=true \
    /p:PublishTrimmed=false

FROM postgres:17-bookworm AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["/app/DevInn.Backup"]
