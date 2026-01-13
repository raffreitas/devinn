using DevInn.Application.Common.Data.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class UnitOfWork(ApplicationDbContext dbContext) : IUnitOfWork
{
    public async Task CommitAsync(CancellationToken cancellationToken = default)
        => await dbContext.SaveChangesAsync(cancellationToken);
}