namespace DevInn.Domain.Aggregates.Financial.Abstractions;

public interface IRecurringExpenseRepository
{
    Task<RecurringExpense?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<RecurringExpense>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Enums.RecurringExpenseStatus? status = null,
        CancellationToken cancellationToken = default);
    Task<int> CountAsync(Enums.RecurringExpenseStatus? status = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RecurringExpense>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task AddAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken);
    Task UpdateAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken = default);
}