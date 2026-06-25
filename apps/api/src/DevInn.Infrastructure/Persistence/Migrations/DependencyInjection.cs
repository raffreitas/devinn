using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Persistence.Context;
using DevInn.Infrastructure.Persistence.Interceptors;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Infrastructure.Persistence.Migrations;

public static class DependencyInjection
{
    public static IServiceCollection AddMigrationPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionStringOrThrow("DatabaseConnection");

        services.AddHttpContextAccessor();
        services.AddScoped<ITenantContext, MigrationTenantContext>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var tenantContext = sp.GetRequiredService<ITenantContext>();
            var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

            options.UseNpgsql(
                    connectionString,
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(
                    new AuditLogInterceptor(tenantContext, httpContextAccessor),
                    new TenantInterceptors(tenantContext));
        });

        services.AddDbContext<IdentityDbContext>(options =>
        {
            options.UseNpgsql(
                    connectionString,
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention();
        });

        return services;
    }
}