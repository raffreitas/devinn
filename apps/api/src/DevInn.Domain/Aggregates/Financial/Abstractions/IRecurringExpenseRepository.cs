namespace DevInn.Domain.Aggregates.Financial.Abstractions;

public interface IRecurringExpenseRepository
{
    Task<RecurringExpense?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<RecurringExpense>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task AddAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken);
    Task UpdateAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken = default);
}