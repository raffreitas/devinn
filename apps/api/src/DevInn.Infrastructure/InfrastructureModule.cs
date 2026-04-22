using DevInn.Infrastructure.BackgroundJobs;
using DevInn.Infrastructure.Email;
using DevInn.Infrastructure.Identity;
using DevInn.Infrastructure.Observability;
using DevInn.Infrastructure.Persistence;
using DevInn.Infrastructure.Persistence.SeedData;
using DevInn.Infrastructure.Time;
using DevInn.Infrastructure.Tokens;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DevInn.Infrastructure;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructureModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.ConfigureJobs(configuration);
        services.ConfigurePersistence(configuration);
        services.ConfigureEmail(configuration);
        services.ConfigureIdentityService(configuration);
        services.ConfigureTokenService(configuration);
        services.ConfigureObservability(configuration);
        services.ConfigureTimeProviders();

        return services;
    }

    public static WebApplication UseInfrastructureModule(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return app;

        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetService<DatabaseSeed>();
        seeder?.SeedAsync().GetAwaiter().GetResult();

        return app;
    }
}
