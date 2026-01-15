using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class Room : Entity
{
    public Guid CategoryId { get; private set; }
    public int Number { get; private set; }
    public string? Name { get; private set; }
    public RoomStatus Status { get; private set; }

    public Room(
        Guid categoryId,
        int number,
        string? name)
    {
        CategoryId = categoryId;
        Number = number;
        Name = name;
        Status = RoomStatus.Inactive;
    }

    public void Update(
        Guid categoryId,
        int number,
        string? name,
        RoomStatus status)
    {
        CategoryId = categoryId;
        Number = number;
        Name = name;
        Status = status;
    }
}