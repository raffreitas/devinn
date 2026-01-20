using DevInn.Infrastructure.Common.Constants;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace DevInn.Infrastructure.Persistence.Factories;

internal sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                          ?? EnvironmentNames.Production;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionStringOrThrow("DatabaseConnection");
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure();
        }).UseSnakeCaseNamingConvention();
        return new ApplicationDbContext(optionsBuilder.Options, null!);
    }
}