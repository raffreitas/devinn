using DevInn.Application.Common.Time;
using DevInn.Infrastructure.Time.Providers;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DevInn.Infrastructure.Time;

internal static class DependencyInjection
{
    public static IServiceCollection ConfigureTimeProviders(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        return services.AddSingleton<IDateTimeProvider, BrazilDateTimeProvider>();
    }
}