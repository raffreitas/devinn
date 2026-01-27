using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class RoomCategory : Entity
{
    public string Name { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public int MaxCapacity { get; private set; }
    public PricingPolicy PricingPolicy { get; private set; } = null!;

    private RoomCategory()
    {
    }

    public RoomCategory(
        string name,
        string description,
        int maxCapacity,
        PricingPolicy pricingPolicy)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = pricingPolicy;
    }

    public void Update(string name, int maxCapacity, string description, decimal basePrice, decimal extraPersonPrice)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = new PricingPolicy(basePrice, extraPersonPrice);
    }
}