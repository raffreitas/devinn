using DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;
using DevInn.Domain.Aggregates.Integrations.Abstractions;

using Mediator;

using Microsoft.Extensions.Logging;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs;

[DisallowConcurrentExecution]
public class SyncAllChannelsJob(
    IChannelIntegrationRepository integrationRepository,
    IMediator mediator,
    ILogger<SyncAllChannelsJob> logger
) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("Starting SyncAllChannelsJob execution");

        try
        {
            var activeIntegrations = await integrationRepository.GetAllActiveAsync(context.CancellationToken);
            var integrationsList = activeIntegrations.ToList();

            logger.LogInformation("Found {Count} active integrations to sync", integrationsList.Count);

            foreach (var integration in integrationsList)
            {
                try
                {
                    logger.LogInformation("Syncing integration {IntegrationId} for room {RoomId}",
                        integration.Id, integration.RoomId);

                    var command = new SyncChannelIntegrationCommand(integration.Id);
                    var result = await mediator.Send(command, context.CancellationToken);

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
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error syncing integration {IntegrationId}", integration.Id);
                }
            }

            logger.LogInformation("SyncAllChannelsJob execution completed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Critical error in SyncAllChannelsJob");
            throw;
        }
    }
}