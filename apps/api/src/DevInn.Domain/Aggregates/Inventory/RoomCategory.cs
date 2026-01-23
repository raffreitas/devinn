using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class RoomCategory : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public int MaxCapacity { get; private set; }
    public PricingPolicy PricingPolicy { get; private set; }

    private RoomCategory()
    {
    }

    public RoomCategory(
        string name,
        string description,
        int maxCapacity,
        decimal basePrice,
        decimal extraPersonPrice,
        PricingPolicy? pricingPolicy = null)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = pricingPolicy ?? new PricingPolicy(basePrice, extraPersonPrice);
    }

    public void Update(string name, int maxCapacity, string description, decimal basePrice, decimal extraPersonPrice)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = new PricingPolicy(basePrice, extraPersonPrice);
    }
}