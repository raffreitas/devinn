using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;

using Mediator;

using Microsoft.Extensions.Logging;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class SyncAllChannelsJob(
    IDbConnectionFactory dbConnectionFactory,
    IMediator mediator,
    ILogger<SyncAllChannelsJob> logger
) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("Starting SyncAllChannelsJob execution");

        await using var dbConnection = await dbConnectionFactory.OpenConnectionAsync(context.CancellationToken);
        const string query = """
                             SELECT id AS "Id", room_id as "RoomId"
                             FROM channel_integrations
                             WHERE is_active = true
                             """;

        var activeIntegrations = await dbConnection.QueryAsync<IntegrationRow>(query, context.CancellationToken);
        var integrationsList = activeIntegrations.ToList();

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

    private sealed record IntegrationRow(Guid Id, Guid RoomId);
}