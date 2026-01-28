using DevInn.Infrastructure.BackgroundJobs;
using DevInn.Infrastructure.Identity;
using DevInn.Infrastructure.Observability;
using DevInn.Infrastructure.Persistence;
using DevInn.Infrastructure.Persistence.SeedData;
using DevInn.Infrastructure.Tokens;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Quartz;

namespace DevInn.Infrastructure;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructureModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.ConfigurePersistence(configuration);
        services.ConfigureIdentityService(configuration);
        services.ConfigureTokenService(configuration);
        services.ConfigureQuartzJobs();
        services.ConfigureObservability(configuration);

        return services;
    }

    private static void ConfigureQuartzJobs(this IServiceCollection services)
    {
        services.AddQuartz(q =>
        {
            // Register SyncAllChannelsJob
            var jobKey = new JobKey(nameof(SyncAllChannelsJob));
            q.AddJob<SyncAllChannelsJob>(opts => opts.WithIdentity(jobKey));

            // Schedule job to run every 3 hours
            q.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity($"{nameof(SyncAllChannelsJob)}-trigger")
                .WithCronSchedule("0 0 */3 * * ?") // Every 3 hours at minute 0
                .WithDescription("Sync all active channel integrations every 3 hours"));
        });

        // Add Quartz hosted service
        services.AddQuartzHostedService(options =>
        {
            options.WaitForJobsToComplete = true;
        });
    }

    public static WebApplication UseInfrastructureModule(this WebApplication app)
    {
        // Trigger initial sync on startup (compensates for in-memory Quartz)
        Task.Run(async () =>
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(30)); // Wait for app to be ready
                using var scope = app.Services.CreateScope();
                var scheduler = scope.ServiceProvider.GetRequiredService<ISchedulerFactory>();
                var sched = await scheduler.GetScheduler();
                var jobKey = new JobKey(nameof(SyncAllChannelsJob));
                await sched.TriggerJob(jobKey);
            }
            catch
            {
                // Ignore errors on startup sync
            }
        });

        if (!app.Environment.IsDevelopment()) return app;

        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetService<DatabaseSeed>();
        seeder?.SeedAsync().GetAwaiter().GetResult();

        return app;
    }
}