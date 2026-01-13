FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/DevInn.WebApi/DevInn.WebApi.csproj", "src/DevInn.WebApi/"]
COPY ["src/DevInn.Infrastructure/DevInn.Infrastructure.csproj", "src/DevInn.Infrastructure/"]
COPY ["src/DevInn.Application/DevInn.Application.csproj", "src/DevInn.Application/"]
COPY ["src/DevInn.Domain/DevInn.Domain.csproj", "src/DevInn.Domain/"]
RUN dotnet restore "src/DevInn.WebApi/DevInn.WebApi.csproj"
COPY . .
WORKDIR "/src/src/DevInn.WebApi"
RUN dotnet build "./DevInn.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./DevInn.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DevInn.WebApi.dll"]
