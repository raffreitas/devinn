using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class RoomCategory : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public int MaxCapacity { get; private set; }
    public decimal BasePrice { get; private set; }
    public decimal ExtraPersonPrice { get; private set; }

    public RoomCategory(
        string name,
        string description,
        int maxCapacity,
        decimal basePrice,
        decimal extraPersonPrice)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        BasePrice = basePrice;
        ExtraPersonPrice = extraPersonPrice;
    }

    public void Update(string name, int maxCapacity, string description, decimal basePrice, decimal extraPersonPrice)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        BasePrice = basePrice;
        ExtraPersonPrice = extraPersonPrice;
    }
}