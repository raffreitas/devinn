using DevInn.Application.Common.Time;
using DevInn.Infrastructure.Time.Providers;

using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Infrastructure.Time;

internal static class DependencyInjection
{
    public static IServiceCollection ConfigureTimeProviders(this IServiceCollection services)
    {
        return services.AddSingleton<IDateTimeProvider, BrazilDateTimeProvider>();
    }
}