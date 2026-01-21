namespace DevInn.WebApi.Configuration;

public static class CorsConfiguration
{
    const string AllowFrontendPolicy = "AllowFrontendPolicy";

    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
    {
        var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
                             ?? "http://localhost:5173";

        var origins = allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        services.AddCors(options =>
        {
            options.AddPolicy(AllowFrontendPolicy, policy =>
            {
                policy.WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }

    public static IApplicationBuilder UseCorsConfiguration(this IApplicationBuilder app)
    {
        app.UseCors(AllowFrontendPolicy);

        return app;
    }
}