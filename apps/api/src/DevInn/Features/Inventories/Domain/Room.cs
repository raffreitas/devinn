using DevInn.Shared.Domain;

namespace DevInn.Features.Inventories.Domain;

public sealed class Room : AggregateRoot
{
    public Guid InnId { get; private set; }
    public Guid CategoryId { get; private set; }
    public int Number { get; private set; }
    public string? Name { get; private set; }
    public RoomStatus Status { get; private set; }

    public Room(
        Guid innId,
        Guid categoryId,
        int number,
        string? name,
        RoomStatus status)
    {
        InnId = innId;
        CategoryId = categoryId;
        Number = number;
        Name = name;
        Status = status;
    }
}

public enum RoomStatus
{
    Active = 1,
    Maintenance,
    Inactive
}