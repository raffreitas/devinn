using DevInn.Infrastructure.Common.Constants;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Observability.Options;

using Grafana.OpenTelemetry;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Npgsql;

using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace DevInn.Infrastructure.Observability;

public static class DependencyInjection
{
    private static string[] PathsToIgnore = ["/health", "/alive", "/scalar", "/openapi"];

    public static IServiceCollection ConfigureObservability(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<ObservabilityOptions>()
            .BindConfiguration(ObservabilityOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var observabilityOptions = configuration.GetOrThrow<ObservabilityOptions>(ObservabilityOptions.SectionName);

        if (!observabilityOptions.Enabled)
            return services;

        var isProduction = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == EnvironmentNames.Production;

        var otelBuilder = services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(
                serviceName: AppDomain.CurrentDomain.FriendlyName,
                serviceInstanceId: Environment.MachineName
            ))
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddNpgsqlInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddProcessInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation(options =>
                    {
                        options.Filter = context =>
                            !PathsToIgnore.Any(path => context.Request.Path.StartsWithSegments(path)) &&
                            context.Request.Method != HttpMethod.Options.Method;

                        options.RecordException = true;
                    })
                    .SetErrorStatusOnException()
                    .AddHttpClientInstrumentation()
                    .AddQuartzInstrumentation()
                    .AddNpgsql();
            })
            .WithLogging(_ => { }, options =>
            {
                options.IncludeScopes = true;
                options.ParseStateValues = true;
                options.IncludeFormattedMessage = true;

                if (isProduction) options.UseGrafana();
            });


        if (isProduction) otelBuilder.UseGrafana();
        else otelBuilder.UseOtlpExporter();

        return services;
    }
}