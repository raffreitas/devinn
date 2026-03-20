using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class ChannelIntegrationRepository(ApplicationDbContext dbContext) : IChannelIntegrationRepository
{
    public async Task AddAsync(ChannelIntegration integration, CancellationToken cancellationToken = default)
        => await dbContext.ChannelIntegrations.AddAsync(integration, cancellationToken);

    public Task RemoveAsync(ChannelIntegration integration, CancellationToken cancellationToken = default)
    {
        dbContext.ChannelIntegrations.Remove(integration);
        return Task.CompletedTask;
    }

    public async Task<ChannelIntegration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.ChannelIntegrations
            .FirstOrDefaultAsync(ci => ci.Id == id, cancellationToken);

    public async Task<IReadOnlyList<ChannelIntegration>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        => await dbContext.ChannelIntegrations
            .Where(ci => ci.IsActive)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsByRoomIdAsync(Guid roomId, Guid? excludeId = null,
        CancellationToken cancellationToken = default)
        => await dbContext.ChannelIntegrations
            .AnyAsync(ci => ci.RoomId == roomId && (excludeId == null || ci.Id != excludeId), cancellationToken);
}