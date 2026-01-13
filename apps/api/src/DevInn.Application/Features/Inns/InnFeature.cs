using DevInn.Application.Features.Inns.CreateInn;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application.Features.Inns;

public static class InnFeature
{
    public static IServiceCollection AddInnFeature(this IServiceCollection services)
    {
        services.AddScoped<ICreateInnUseCase, CreateInnUseCase>();
        return services;
    }
}