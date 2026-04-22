namespace DevInn.Infrastructure.Persistence.Auditing;

internal sealed class AuditLog
{
    public Guid Id { get; private set; } = Guid.CreateVersion7();
    public Guid InnId { get; private set; }
    public string Module { get; private set; } = null!;
    public string EntityName { get; private set; } = null!;
    public Guid EntityId { get; private set; }
    public string Action { get; private set; } = null!;
    public Guid? ActorId { get; private set; }
    public string Summary { get; private set; } = null!;
    public string? Changes { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;

    private AuditLog()
    {
    }

    public AuditLog(
        Guid innId,
        string module,
        string entityName,
        Guid entityId,
        string action,
        Guid? actorId,
        string summary,
        string? changes)
    {
        InnId = innId;
        Module = module;
        EntityName = entityName;
        EntityId = entityId;
        Action = action;
        ActorId = actorId;
        Summary = summary;
        Changes = changes;
        OccurredAt = DateTimeOffset.UtcNow;
    }
}
