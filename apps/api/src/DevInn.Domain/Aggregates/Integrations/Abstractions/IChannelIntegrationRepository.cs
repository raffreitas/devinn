namespace DevInn.Domain.Aggregates.Integrations.Abstractions;

public interface IChannelIntegrationRepository
{
    Task AddAsync(ChannelIntegration integration, CancellationToken cancellationToken = default);
    Task RemoveAsync(ChannelIntegration integration, CancellationToken cancellationToken = default);
    Task<ChannelIntegration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChannelIntegration>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByRoomIdAsync(Guid roomId, Guid? excludeId = null, CancellationToken cancellationToken = default);
}