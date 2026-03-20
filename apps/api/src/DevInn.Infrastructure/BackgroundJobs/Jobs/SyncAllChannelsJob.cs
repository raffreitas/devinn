using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;

using Mediator;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs.Jobs;

[DisallowConcurrentExecution]
internal sealed class SyncAllChannelsJob(
    IDbConnectionFactory dbConnectionFactory,
    ILogger<SyncAllChannelsJob> logger,
    IServiceScopeFactory serviceScopeFactory
) : IJob
{
    private const int MaxDegreeOfParallelism = 5;

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("Starting SyncAllChannelsJob execution");

        const string query = """
                             SELECT id AS "Id", room_id as "RoomId", "inn_id" as "InnId"
                             FROM channel_integrations
                             WHERE is_active = true
                             """;

        await using var dbConnection = await dbConnectionFactory.OpenConnectionAsync(context.CancellationToken);
        var activeIntegrations = await dbConnection.QueryAsync<IntegrationRow>(query, context.CancellationToken);

        using var semaphore = new SemaphoreSlim(MaxDegreeOfParallelism);
        var tasks = activeIntegrations.Select(integration =>
            SyncIntegrationAsync(integration, semaphore, context.CancellationToken));

        await Task.WhenAll(tasks);

        logger.LogInformation("SyncAllChannelsJob execution completed");
    }

    private async Task SyncIntegrationAsync(
        IntegrationRow integration,
        SemaphoreSlim semaphore,
        CancellationToken cancellationToken)
    {
        await semaphore.WaitAsync(cancellationToken);
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
        finally
        {
            semaphore.Release();
        }
    }

    private sealed record IntegrationRow(Guid Id, Guid RoomId, Guid InnId);
}