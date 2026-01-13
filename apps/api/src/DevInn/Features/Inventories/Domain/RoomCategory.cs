using DevInn.Shared.Domain;

namespace DevInn.Features.Inventories.Domain;

public sealed class RoomCategory : Entity
{
    public Guid InnId { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public int MaxCapacity { get; private set; }
    public decimal BasePrice { get; private set; }
    public decimal ExtraPersonPrice { get; private set; }

    public RoomCategory(
        Guid innId,
        string name,
        string description,
        int maxCapacity,
        decimal basePrice,
        decimal extraPersonPrice)
    {
        InnId = innId;
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        BasePrice = basePrice;
        ExtraPersonPrice = extraPersonPrice;
    }
}