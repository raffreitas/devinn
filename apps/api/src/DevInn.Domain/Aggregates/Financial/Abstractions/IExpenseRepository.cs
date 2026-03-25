namespace DevInn.Domain.Aggregates.Financial.Abstractions;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Expense?> GetByRecurringExpenseIdAndDueDateAsync(Guid recurringExpenseId, DateOnly dueDate,
        CancellationToken cancellationToken);
    Task AddAsync(Expense expense, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<Expense>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Expense expense, CancellationToken cancellationToken = default);
    Task DeleteAsync(Expense expense, CancellationToken cancellationToken = default);
}