using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class ExpenseRepository(ApplicationDbContext dbContext) : IExpenseRepository
{
    public async Task AddAsync(Expense expense, CancellationToken cancellationToken)
    {
        await dbContext.Expenses.AddAsync(expense, cancellationToken);
    }

    public async Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Expense>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Expenses.AsNoTracking().ToListAsync(cancellationToken);
    }
}