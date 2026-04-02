using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory;

public sealed class RoomCategory : Entity
{
    public string Name { get; private set; } = null!;
    public int MaxCapacity { get; private set; }
    public string? Description { get; private set; }
    public PricingPolicy PricingPolicy { get; private set; } = null!;

    private RoomCategory()
    {
    }

    public RoomCategory(
        string name,
        string? description,
        int maxCapacity,
        PricingPolicy pricingPolicy)
    {
        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = pricingPolicy;

        Validate(this);
    }

    public void Update(string name, int maxCapacity, string description, decimal basePrice, decimal extraPersonPrice)
    {
        var newPricingPolicy = new PricingPolicy(basePrice, extraPersonPrice);

        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = newPricingPolicy;

        Validate(this);
    }

    private static void Validate(RoomCategory roomCategory)
    {
        DomainException.ThrowIfNullOrWhiteSpace(roomCategory.Name, nameof(Name));
        DomainException.ThrowIfNull(roomCategory.PricingPolicy, nameof(PricingPolicy));

        if (roomCategory.MaxCapacity <= 0)
            throw new DomainException("A capacidade máxima deve ser maior que zero.");
    }
}