using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Persistence.Context;
using DevInn.Infrastructure.Persistence.Migrations;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

ILogger? migratorLogger = null;

try
{
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddMigrationPersistence(builder.Configuration);

    using var host = builder.Build();
    using var scope = host.Services.CreateScope();

    migratorLogger = scope.ServiceProvider
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("DevInn.DatabaseMigrator");

    migratorLogger.LogInformation("Starting database migrations.");

    var applicationDbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await MigrateAsync(applicationDbContext, nameof(ApplicationDbContext), migratorLogger);

    var identityDbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await MigrateAsync(identityDbContext, nameof(IdentityDbContext), migratorLogger);

    migratorLogger.LogInformation("Database migrations completed successfully.");
    return 0;
}
catch (Exception exception)
{
    if (migratorLogger is null)
    {
        Console.Error.WriteLine("Database migrations failed.");
        Console.Error.WriteLine(exception);
    }
    else
    {
        migratorLogger.LogCritical(exception, "Database migrations failed.");
    }

    return 1;
}

async Task MigrateAsync(DbContext dbContext, string contextName, ILogger logger)
{
    logger.LogInformation("Checking pending migrations for {ContextName}.", contextName);

    var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync()).ToArray();
    if (pendingMigrations.Length == 0)
    {
        logger.LogInformation("No pending migrations for {ContextName}.", contextName);
        return;
    }

    logger.LogInformation(
        "Applying {MigrationCount} pending migrations for {ContextName}: {MigrationNames}.",
        pendingMigrations.Length,
        contextName,
        string.Join(", ", pendingMigrations));

    await dbContext.Database.MigrateAsync();

    logger.LogInformation("Finished migrations for {ContextName}.", contextName);
}