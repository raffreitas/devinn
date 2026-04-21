using System.Security.Claims;
using System.Text.Json;

using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Infrastructure.Persistence.Auditing;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DevInn.Infrastructure.Persistence.Interceptors;

internal sealed class AuditLogInterceptor(ITenantContext tenantContext, IHttpContextAccessor httpContextAccessor)
    : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private static readonly HashSet<string> UntrackedProperties =
        ["Id", "InnId", "CreatedAt", "UpdatedAt", "DeletedAt", "DeletedBy", "RowVersion"];

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        AppendAuditLogs(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        AppendAuditLogs(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AppendAuditLogs(DbContext? context)
    {
        if (context is null)
            return;

        var logs = context.ChangeTracker.Entries()
            .Where(IsAuditableEntry)
            .Select(CreateAuditLog)
            .ToArray();

        if (logs.Length == 0)
            return;

        context.Set<AuditLog>().AddRange(logs);
    }

    private static bool IsAuditableEntry(EntityEntry entry)
        => entry.Entity is Booking or Room or ChannelIntegration
           && entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted;

    private AuditLog CreateAuditLog(EntityEntry entry)
    {
        var action = ResolveAction(entry);
        (string module, string entityName, string summary) = ResolveMetadata(entry.Entity, action);
        var actorId = ResolveActorId();
        var entityId = ResolveEntityId(entry);
        var changes = SerializeChanges(entry);

        return new AuditLog(
            tenantContext.Tenant.Id,
            module,
            entityName,
            entityId,
            action,
            actorId,
            summary,
            changes);
    }

    private static Guid ResolveEntityId(EntityEntry entry)
        => entry.Properties.First(p => p.Metadata.Name == "Id").CurrentValue is Guid id ? id : Guid.Empty;

    private Guid? ResolveActorId()
    {
        var raw = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var actorId) ? actorId : null;
    }

    private static string ResolveAction(EntityEntry entry)
    {
        if (entry.State == EntityState.Added)
            return "Created";

        if (entry.State == EntityState.Deleted)
            return "Deleted";

        if (entry.Entity is Booking booking
            && entry.Property(nameof(Booking.DeletedAt)).IsModified
            && booking.DeletedAt.HasValue)
            return "SoftDeleted";

        return "Updated";
    }

    private static (string Module, string EntityName, string Summary) ResolveMetadata(object entity, string action)
        => entity switch
        {
            Booking => ("Bookings", "Booking",
                ResolveSummary(action, "Reserva criada", "Reserva atualizada", "Reserva excluída")),
            Room => ("Inventory", "Room",
                ResolveSummary(action, "Quarto criado", "Quarto atualizado", "Quarto excluído")),
            ChannelIntegration => ("Integrations", "ChannelIntegration",
                ResolveSummary(action, "Integração criada", "Integração atualizada", "Integração excluída")),
            _ => throw new InvalidOperationException($"Tipo de auditoria não suportado: {entity.GetType().Name}")
        };

    private static string ResolveSummary(string action, string created, string updated, string deleted) => action switch
    {
        "Created" => created,
        "Updated" => updated,
        "Deleted" => deleted,
        "SoftDeleted" => deleted,
        _ => updated
    };

    private static string? SerializeChanges(EntityEntry entry)
    {
        Dictionary<string, AuditChange> changes = entry.State switch
        {
            EntityState.Added => entry.Properties
                .Where(p => ShouldTrackProperty(p.Metadata.Name))
                .ToDictionary(
                    p => p.Metadata.Name,
                    p => new AuditChange(null, ToAuditValue(p.CurrentValue))),
            EntityState.Modified => entry.Properties
                .Where(p => p.IsModified && ShouldTrackProperty(p.Metadata.Name))
                .ToDictionary(
                    p => p.Metadata.Name,
                    p => new AuditChange(ToAuditValue(p.OriginalValue), ToAuditValue(p.CurrentValue))),
            EntityState.Deleted => entry.Properties
                .Where(p => ShouldTrackProperty(p.Metadata.Name))
                .ToDictionary(
                    p => p.Metadata.Name,
                    p => new AuditChange(ToAuditValue(p.OriginalValue), null)),
            _ => []
        };

        return changes.Count == 0 ? null : JsonSerializer.Serialize(changes, JsonOptions);
    }

    private static bool ShouldTrackProperty(string propertyName) => !UntrackedProperties.Contains(propertyName);

    private static string? ToAuditValue(object? value) => value switch
    {
        null => null,
        DateTimeOffset dto => dto.ToString("O"),
        DateTime dt => dt.ToString("O"),
        DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd"),
        _ => value.ToString()
    };

    private sealed record AuditChange(string? Before, string? After);
}