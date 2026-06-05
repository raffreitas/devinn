using DevInn.Application.Features.Integrations.Services;
using DevInn.Infrastructure.BackgroundJobs.Jobs;
using DevInn.Infrastructure.BackgroundJobs.Options;
using DevInn.Infrastructure.BackgroundJobs.Providers;
using DevInn.Infrastructure.BackgroundJobs.Stores;
using DevInn.Infrastructure.Common.Extensions;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs;

public static class DependencyInjection
{
    internal static IServiceCollection ConfigureJobs(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<BackgroundJobsOptions>()
            .BindConfiguration(BackgroundJobsOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<INextSyncTimeProvider, QuartzNextSyncTimeProvider>();
        services.AddScoped<IChannelIntegrationSyncWorkStore, ChannelIntegrationSyncWorkStore>();

        var jobsOptions = configuration.GetOrThrow<BackgroundJobsOptions>(BackgroundJobsOptions.SectionName);

        if (!jobsOptions.Enabled) return services;

        services.AddQuartz(q =>
        {
            var jobKey = new JobKey(nameof(SyncAllChannelsJob));
            q.AddJob<SyncAllChannelsJob>(opts => opts.WithIdentity(jobKey));

            q.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity($"{nameof(SyncAllChannelsJob)}-trigger")
                .WithCronSchedule(jobsOptions.CronExpression)
                .WithDescription($"Sync all active channel integrations every {jobsOptions.CronExpression}"));
        });

        services.AddQuartzHostedService(options =>
        {
            options.WaitForJobsToComplete = true;
        });

        return services;
    }
}
