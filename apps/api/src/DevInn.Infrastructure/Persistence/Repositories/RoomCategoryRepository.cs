using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class RoomCategoryRepository(ApplicationDbContext dbContext) : IRoomCategoryRepository
{
    public async Task AddAsync(RoomCategory category, CancellationToken cancellationToken = default)
    {
        await dbContext.RoomCategories.AddAsync(category, cancellationToken);
    }

    public async Task<RoomCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.RoomCategories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<RoomCategory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.RoomCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<RoomCategory?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await dbContext.RoomCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
    }

    public Task UpdateAsync(RoomCategory category, CancellationToken cancellationToken = default)
    {
        dbContext.RoomCategories.Update(category);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(RoomCategory category, CancellationToken cancellationToken = default)
    {
        dbContext.RoomCategories.Remove(category);
        return Task.CompletedTask;
    }
}