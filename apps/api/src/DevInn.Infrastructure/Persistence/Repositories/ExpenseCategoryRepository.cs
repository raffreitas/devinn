using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class ExpenseCategoryRepository(ApplicationDbContext dbContext) : IExpenseCategoryRepository
{
    public async Task AddAsync(ExpenseCategory category, CancellationToken cancellationToken)
    {
        await dbContext.ExpenseCategories.AddAsync(category, cancellationToken);
    }

    public async Task<ExpenseCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.ExpenseCategories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<ExpenseCategory?> GetByNameAsync(string name, CancellationToken cancellationToken)
    {
        return await dbContext.ExpenseCategories.FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
    }

    public async Task<IReadOnlyCollection<ExpenseCategory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.ExpenseCategories.AsNoTracking().ToListAsync(cancellationToken);
    }
}