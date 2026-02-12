namespace DevInn.Domain.SeedWork;

public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();
    public DateTimeOffset CreatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public Guid InnId { get; private set; }

    public void SetTenantId(Guid innId)
    {
        InnId = innId;
    }
}