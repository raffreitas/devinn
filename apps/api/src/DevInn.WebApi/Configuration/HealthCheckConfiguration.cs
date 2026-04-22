using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DevInn.WebApi.Configuration;

internal static class HealthCheckConfiguration
{
    public static IServiceCollection AddHealthCheckConfiguration(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck("live", check: () => HealthCheckResult.Healthy(), tags: new[] { "live" })
            .AddDbContextCheck<ApplicationDbContext>(name: "app-db", tags: new[] { "ready" })
            .AddDbContextCheck<IdentityDbContext>(name: "identity-db", tags: new[] { "ready" });
        return services;
    }

    public static IApplicationBuilder UseHealthCheckConfiguration(this WebApplication app)
    {
        // Liveness probe - quick check if application is running
        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("live"),
        });

        // Readiness probe - check if application is ready to handle requests
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("ready"),
        });

        // Legacy endpoint - maps to readiness probe
        app.MapHealthChecks("/health");

        return app;
    }
}