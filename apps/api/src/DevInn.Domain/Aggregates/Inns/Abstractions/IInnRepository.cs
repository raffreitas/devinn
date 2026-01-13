namespace DevInn.Domain.Aggregates.Inns.Abstractions;

public interface IInnRepository
{
    Task AddAsync(Inn inn, CancellationToken cancellationToken = default);
}