namespace DevInn.Application.Features.Integrations.Abstractions;

public interface IChannelIntegrationSyncOrchestrator
{
    Task<int> SyncChannelIntegrationAsync(Guid integrationId, CancellationToken cancellationToken = default);
}
