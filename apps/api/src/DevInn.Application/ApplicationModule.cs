using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Services;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application;

public static class ApplicationModule
{
    public static IServiceCollection AddApplicationModule(this IServiceCollection services)
    {
        services.AddMediator(o => o.ServiceLifetime = ServiceLifetime.Scoped);

        services.AddScoped<ITenantContext, TenantContext>();

        services.AddDomainServices();

        return services;
    }

    private static void AddDomainServices(this IServiceCollection services)
    {
        services.AddScoped<IPricingCalculatorService, PricingCalculatorService>();
    }
}