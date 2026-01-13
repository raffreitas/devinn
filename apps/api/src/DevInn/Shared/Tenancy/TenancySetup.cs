namespace DevInn.Shared.Tenancy;

public static class TenancySetup
{
    public static IServiceCollection AddTenancyConfiguration(this IServiceCollection services)
    {
        services.AddScoped<ITenantContext, TenantContext>();

        return services;
    }

    public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder app)
    {
        app.UseMiddleware<TenantMiddleware>();
        return app;
    }
}
