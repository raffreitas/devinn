using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class Room : Entity
{
    public Guid CategoryId { get; private set; }
    public int Number { get; private set; }
    public string? Name { get; private set; }
    public RoomStatus Status { get; private set; }
    public ICalExportToken ICalExportToken { get; private set; }

    private Room()
    {
    }

    public Room(
        Guid categoryId,
        int number,
        string? name = null,
        RoomStatus? status = null
    )
    {
        CategoryId = categoryId;
        Number = number;
        Name = name;
        Status = status ?? RoomStatus.Active;
        ICalExportToken = ICalExportToken.Generate();
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

    public void Activate() => Status = RoomStatus.Active;

    public void RegenerateICalExportToken()
    {
        if (InnId == Guid.Empty)
            throw new DomainException("Não é possível regenerar token sem InnId definido.");

        ICalExportToken = ICalExportToken.Generate();
    }
}