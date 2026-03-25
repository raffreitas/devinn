using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class RecurringExpenseRepository(ApplicationDbContext dbContext) : IRecurringExpenseRepository
{
    public async Task<RecurringExpense?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.RecurringExpenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<RecurringExpense>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        RecurringExpenseStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.RecurringExpenses.AsNoTracking();

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(
        RecurringExpenseStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.RecurringExpenses.AsNoTracking();

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<RecurringExpense>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.RecurringExpenses
            .Where(e => e.Status == RecurringExpenseStatus.Active)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken)
    {
        await dbContext.RecurringExpenses.AddAsync(recurringExpense, cancellationToken);
    }

    public Task UpdateAsync(RecurringExpense recurringExpense, CancellationToken cancellationToken = default)
    {
        dbContext.RecurringExpenses.Update(recurringExpense);
        return Task.CompletedTask;
    }
}