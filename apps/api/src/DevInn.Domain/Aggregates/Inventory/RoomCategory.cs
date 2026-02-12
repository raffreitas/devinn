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
        Validate(name, description, maxCapacity, pricingPolicy);

        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = pricingPolicy;
    }

    public void Update(string name, int maxCapacity, string description, decimal basePrice, decimal extraPersonPrice)
    {
        var newPricingPolicy = new PricingPolicy(basePrice, extraPersonPrice);
        Validate(name, description, maxCapacity, newPricingPolicy);

        Name = name;
        Description = description;
        MaxCapacity = maxCapacity;
        PricingPolicy = newPricingPolicy;
    }

    private static void Validate(
        string name,
        string description,
        int maxCapacity,
        PricingPolicy pricingPolicy
    )
    {
        DomainException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        DomainException.ThrowIfNullOrWhiteSpace(description, nameof(description));
        DomainException.ThrowIfNull(pricingPolicy, nameof(pricingPolicy));

        if (maxCapacity <= 0)
            throw new DomainException("A capacidade máxima deve ser maior que zero.");
    }
}