using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DevInn.WebApi.Configuration;

internal static class HealthCheckConfiguration
{
    public static IServiceCollection AddHealthCheckConfiguration(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>(name: "app-db")
            .AddDbContextCheck<IdentityDbContext>(name: "identity-db")
            .AddCheck(name: "self", check: () => HealthCheckResult.Healthy());
        return services;
    }

    public static IApplicationBuilder UseHealthCheckConfiguration(this WebApplication app)
    {
        app.MapHealthChecks("/health");

        return app;
    }
}