using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.SeedWork;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DevInn.Infrastructure.Persistence.Interceptors;

internal sealed class TenantInterceptors(ITenantContext tenantContext) : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;

        if (context is null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

        var entries = context.ChangeTracker.Entries().Where(e => e.State is EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.Entity is Entity entity)
            {
                entity.SetTenantId(tenantContext.Tenant.Id);
            }
        }

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        var context = eventData.Context;
        if (context is null) return base.SavingChanges(eventData, result);
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);
        foreach (var entry in entries)
        {
            if (entry.Entity is Entity entity)
            {
                entity.SetTenantId(tenantContext.Tenant.Id);
            }
        }

        return base.SavingChanges(eventData, result);
    }
}