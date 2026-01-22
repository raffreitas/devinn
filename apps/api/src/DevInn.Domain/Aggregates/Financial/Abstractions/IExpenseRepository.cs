namespace DevInn.Domain.Aggregates.Financial.Abstractions;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(Expense expense, CancellationToken cancellationToken);
}