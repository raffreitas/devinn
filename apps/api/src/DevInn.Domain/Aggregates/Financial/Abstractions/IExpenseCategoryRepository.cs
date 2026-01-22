namespace DevInn.Domain.Aggregates.Financial.Abstractions;

public interface IExpenseCategoryRepository
{
    Task<ExpenseCategory?> GetByNameAsync(string name, CancellationToken cancellationToken);
    Task<ExpenseCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(ExpenseCategory category, CancellationToken cancellationToken);
}