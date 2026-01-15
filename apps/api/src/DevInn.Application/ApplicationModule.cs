using DevInn.Application.Common.Tenancy.Abstractions;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application;

public static class ApplicationModule
{
    public static IServiceCollection AddApplicationModule(this IServiceCollection services)
    {
        services.AddMediator(o => o.ServiceLifetime = ServiceLifetime.Scoped);

        services.AddScoped<ITenantContext, TenantContext>();

        return services;
    }
}