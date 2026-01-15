using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inns.Abstractions;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class InnRepository(ApplicationDbContext dbContext) : IInnRepository
{
    public async Task AddAsync(Inn inn, CancellationToken cancellationToken = default)
        => await dbContext.Inns.AddAsync(inn, cancellationToken);

    public async Task<IReadOnlyCollection<Inn>> GetAllAsync(CancellationToken cancellationToken = default)
        => await dbContext.Inns.ToListAsync(cancellationToken);
}