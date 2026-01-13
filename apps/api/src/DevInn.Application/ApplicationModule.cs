using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Auth;
using DevInn.Application.Features.Inns;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application;

public static class ApplicationModule
{
    public static IServiceCollection AddApplicationModule(this IServiceCollection services)
    {
        services.AddInnFeature();
        services.AddAuthFeature();

        services.AddScoped<ITenantContext, TenantContext>();

        return services;
    }
}