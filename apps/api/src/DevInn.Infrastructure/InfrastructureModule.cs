using DevInn.Infrastructure.Identity;
using DevInn.Infrastructure.Observability;
using DevInn.Infrastructure.Persistence;
using DevInn.Infrastructure.Tokens;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Infrastructure;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructureModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.ConfigurePersistence(configuration);
        services.ConfigureIdentityService(configuration);
        services.ConfigureTokenService(configuration);
        services.ConfigureObservability(configuration);

        return services;
    }
}