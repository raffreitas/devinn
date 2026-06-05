namespace DevInn.Infrastructure.BackgroundJobs.Stores;

internal interface IChannelIntegrationSyncWorkStore
{
    Task<IReadOnlyList<ChannelIntegrationSyncWorkItem>> ClaimDueAsync(
        int batchSize,
        CancellationToken cancellationToken = default);
}

internal sealed record ChannelIntegrationSyncWorkItem(Guid Id, Guid RoomId, Guid InnId);
