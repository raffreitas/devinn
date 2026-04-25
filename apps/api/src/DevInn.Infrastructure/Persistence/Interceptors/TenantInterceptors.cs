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

        ApplyTenantAndTimestamps(context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        var context = eventData.Context;
        if (context is null) return base.SavingChanges(eventData, result);
        ApplyTenantAndTimestamps(context);

        return base.SavingChanges(eventData, result);
    }

    private void ApplyTenantAndTimestamps(DbContext context)
    {
        var now = DateTimeOffset.UtcNow;
        var entries = context.ChangeTracker.Entries()
            .Where(e => e is { Entity: Entity, State: EntityState.Added or EntityState.Modified });

        foreach (var entry in entries)
        {
            if (entry.Entity is not Entity entity)
                continue;

            if (entry.State == EntityState.Added)
            {
                entity.SetTenantId(tenantContext.Tenant.Id);

                var createdAtProperty = entry.Property(nameof(Entity.CreatedAt));
                if (createdAtProperty.CurrentValue is null ||
                    createdAtProperty.CurrentValue.Equals(default(DateTimeOffset)))
                {
                    createdAtProperty.CurrentValue = now;
                }
            }

            entry.Property(nameof(Entity.UpdatedAt)).CurrentValue = now;
        }
    }
}