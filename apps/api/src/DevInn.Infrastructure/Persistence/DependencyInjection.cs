using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Inns.Abstractions;
using DevInn.Infrastructure.Persistence.Context;
using DevInn.Infrastructure.Persistence.Interceptors;
using DevInn.Infrastructure.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Infrastructure.Persistence;

public static class DependencyInjection
{
    internal static IServiceCollection ConfigurePersistence(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var tenantContext = sp.GetRequiredService<ITenantContext>();
            options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(new TenantInterceptors(tenantContext));
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IInnRepository, InnRepository>();


        return services;
    }
}