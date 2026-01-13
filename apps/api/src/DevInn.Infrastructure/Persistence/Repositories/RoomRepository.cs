using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class RoomRepository(ApplicationDbContext dbContext) : IRoomRepository
{
    public async Task AddAsync(Room room, CancellationToken cancellationToken = default)
    {
        await dbContext.Rooms.AddAsync(room, cancellationToken);
    }

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Rooms
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Room>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Rooms
            .AsNoTracking()
            .OrderBy(r => r.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Room>> GetAllByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Rooms
            .Where(r => r.CategoryId == categoryId)
            .OrderBy(r => r.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<Room?> GetByNumberAsync(int number, CancellationToken cancellationToken = default)
    {
        return await dbContext.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Number == number, cancellationToken);
    }

    public async Task<bool> IsNumberUniqueAsync(
        int number,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Rooms
            .Where(r => r.Number == number);

        if (excludeId.HasValue)
            query = query.Where(r => r.Id != excludeId.Value);

        return !await query.AnyAsync(cancellationToken);
    }

    public Task UpdateAsync(Room room, CancellationToken cancellationToken = default)
    {
        dbContext.Rooms.Update(room);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Room room, CancellationToken cancellationToken = default)
    {
        dbContext.Rooms.Remove(room);
        return Task.CompletedTask;
    }
}