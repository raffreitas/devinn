using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;
using DevInn.Infrastructure.BackgroundJobs.Options;
using DevInn.Infrastructure.BackgroundJobs.Stores;

using Mediator;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs.Jobs;

[DisallowConcurrentExecution]
internal sealed class SyncAllChannelsJob(
    IChannelIntegrationSyncWorkStore syncWorkStore,
    ILogger<SyncAllChannelsJob> logger,
    IOptions<BackgroundJobsOptions> options,
    IServiceScopeFactory serviceScopeFactory
) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("Starting SyncAllChannelsJob execution");

        var integrations = await syncWorkStore.ClaimDueAsync(
            options.Value.ChannelSyncBatchSize,
            context.CancellationToken);

        if (integrations.Count == 0)
        {
            logger.LogInformation("No channel integrations due for sync");
            return;
        }

        logger.LogInformation("Claimed {Count} channel integrations for sync", integrations.Count);

        await Parallel.ForEachAsync(
            integrations,
            new ParallelOptions
            {
                MaxDegreeOfParallelism = options.Value.ChannelSyncMaxDegreeOfParallelism,
                CancellationToken = context.CancellationToken
            },
            async (integration, cancellationToken) => await SyncIntegrationAsync(integration, cancellationToken));

        logger.LogInformation("SyncAllChannelsJob execution completed");
    }

    private async Task SyncIntegrationAsync(
        ChannelIntegrationSyncWorkItem integration,
        CancellationToken cancellationToken)
    {
        try
        {
            logger.LogInformation("Syncing integration {IntegrationId} for room {RoomId}",
                integration.Id, integration.RoomId);

            using var scope = serviceScopeFactory.CreateScope();
            var tenantContext = scope.ServiceProvider.GetRequiredService<ITenantContext>();
            var sender = scope.ServiceProvider.GetRequiredService<ISender>();

            tenantContext.SetTenant(new Tenant(integration.InnId));

            var command = new SyncChannelIntegrationCommand(integration.Id);
            var result = await sender.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                logger.LogInformation(
                    "Successfully synced integration {IntegrationId}. Imported {Count} bookings",
                    integration.Id, result.Value);
            }
            else
            {
                logger.LogWarning("Failed to sync integration {IntegrationId}: {Errors}",
                    integration.Id, string.Join(", ", result.Errors.Select(e => e.Message)));
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Error syncing integration {IntegrationId}", integration.Id);
        }
    }
}
