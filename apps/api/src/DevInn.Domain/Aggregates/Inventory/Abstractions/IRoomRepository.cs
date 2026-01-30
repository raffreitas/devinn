namespace DevInn.Domain.Aggregates.Inventory.Abstractions;

public interface IRoomRepository
{
    Task AddAsync(Room room, CancellationToken cancellationToken = default);
    Task<Room?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Room?> GetByICalExportTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<List<Room>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Room>> GetAllByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Room?> GetByNumberAsync(int number, CancellationToken cancellationToken = default);
    Task<bool> IsNumberUniqueAsync(int number, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task UpdateAsync(Room room, CancellationToken cancellationToken = default);
    Task DeleteAsync(Room room, CancellationToken cancellationToken = default);
}