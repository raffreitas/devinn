using System.Threading.RateLimiting;

using DevInn.WebApi.Common;

namespace DevInn.WebApi.Configuration;

internal static class AuthRateLimitConfiguration
{
    public const string ForgotPasswordPolicyName = "forgot-password";
    public const string ResetPasswordPolicyName = "reset-password";

    public static IServiceCollection AddAuthRateLimitConfiguration(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.ContentType = "application/problem+json";

                await context.HttpContext.Response.WriteAsJsonAsync(
                    new ApiProblemDetails
                    {
                        Title = "Muitas requisições",
                        Detail = "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.",
                        Status = StatusCodes.Status429TooManyRequests
                    },
                    cancellationToken);
            };

            options.AddPolicy(ForgotPasswordPolicyName, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext, "forgot-password"),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5, Window = TimeSpan.FromMinutes(15), QueueLimit = 0, AutoReplenishment = true
                    }));

            options.AddPolicy(ResetPasswordPolicyName, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext, "reset-password"),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 8, Window = TimeSpan.FromMinutes(15), QueueLimit = 0, AutoReplenishment = true
                    }));
        });

        return services;
    }

    public static IApplicationBuilder UseAuthRateLimitConfiguration(this IApplicationBuilder app)
    {
        app.UseRateLimiter();

        return app;
    }

    private static string GetClientIp(HttpContext httpContext, string prefix)
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"{prefix}:{ip}";
    }
}