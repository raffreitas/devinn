namespace DevInn.Application.Features.Integrations.Orchestrators;

public interface IChannelIntegrationSyncOrchestrator
{
    Task<int> SyncChannelIntegrationAsync(Guid integrationId, CancellationToken cancellationToken = default);
}
