namespace DevInn.Domain.Aggregates.Inventory.Abstractions;

public interface IRoomCategoryRepository
{
    Task AddAsync(RoomCategory category, CancellationToken cancellationToken = default);
    Task<RoomCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RoomCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RoomCategory?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task UpdateAsync(RoomCategory category, CancellationToken cancellationToken = default);
    Task RemoveAsync(RoomCategory category, CancellationToken cancellationToken = default);
}