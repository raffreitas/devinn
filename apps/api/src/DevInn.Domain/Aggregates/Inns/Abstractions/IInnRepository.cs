namespace DevInn.Domain.Aggregates.Inns.Abstractions;

public interface IInnRepository
{
    Task AddAsync(Inn inn, CancellationToken cancellationToken = default);
    Task<Inn?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Inn>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateAsync(Inn inn, CancellationToken cancellationToken = default);
}
