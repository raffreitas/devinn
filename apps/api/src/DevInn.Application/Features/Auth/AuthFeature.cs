using DevInn.Application.Features.Auth.Login;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application.Features.Auth;

public static class AuthFeature
{
    public static IServiceCollection AddAuthFeature(this IServiceCollection services)
    {
        services.AddScoped<ILoginUseCase, LoginUseCase>();

        return services;
    }
}