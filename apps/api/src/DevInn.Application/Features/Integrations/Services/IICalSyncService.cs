namespace DevInn.Application.Features.Integrations.Services;

public interface IICalSyncService
{
    Task<int> SyncChannelIntegrationAsync(Guid integrationId, CancellationToken cancellationToken = default);
}