namespace DevInn.Shared.Domain;

public abstract class Entity
{
    public Guid Id { get; private set; } = Guid.CreateVersion7();
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;
}