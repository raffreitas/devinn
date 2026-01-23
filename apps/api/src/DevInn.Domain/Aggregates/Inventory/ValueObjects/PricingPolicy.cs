using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory.ValueObjects;

public sealed record PricingPolicy : IValueObject
{
    public decimal BasePrice { get; private init; }
    public decimal PersonPrice { get; private init; }
    public int IncludedOccupants { get; private init; } = 2;
    public ChildrenPricingRules ChildrenRules { get; private init; } = ChildrenPricingRules.Default();

    private PricingPolicy()
    {
    }

    public PricingPolicy(
        decimal basePrice,
        decimal personPrice,
        int includedOccupants = 2,
        ChildrenPricingRules? childrenRules = null)
    {
        if (basePrice < 0)
            throw new DomainException("Preço base não pode ser negativo.");
        if (personPrice < 0)
            throw new DomainException("Valor extra por pessoa não pode ser negativo.");
        if (includedOccupants < 1)
            throw new DomainException("Quantidade de pessoas do valor base deve ser pelo menos 1.");

        BasePrice = basePrice;
        PersonPrice = personPrice;
        IncludedOccupants = includedOccupants;
        ChildrenRules = childrenRules ?? ChildrenPricingRules.Default();
    }

    public (decimal PayingUnits, decimal ChildrenCostPerNight) CalculateOccupancyCharges(Occupancy occupancy)
    {
        DomainException.ThrowIfNull(occupancy, "Ocupação não pode ser nula.");

        decimal childrenWeight = 0m;
        decimal childrenCost = 0m;

        foreach (var childAge in occupancy.ChildrenAges)
        {
            childrenWeight += ChildrenRules.CalculateChildWeight(childAge);
            childrenCost += ChildrenRules.CalculateChildNightCost(childAge, PersonPrice);
        }

        var payingUnits = occupancy.Adults + childrenWeight;

        return (payingUnits, childrenCost);
    }

    public decimal CalculateDailyRate(decimal payingUnits)
    {
        if (payingUnits <= IncludedOccupants)
            return BasePrice;

        return PersonPrice * payingUnits;
    }
}