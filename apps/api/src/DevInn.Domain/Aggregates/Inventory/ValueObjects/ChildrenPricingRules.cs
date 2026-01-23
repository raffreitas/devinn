using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory.ValueObjects;

public sealed record ChildrenPricingRules : IValueObject
{
    public int FreeUntilAge { get; private init; }
    public int HalfPriceUntilAge { get; private init; }

    public ChildrenPricingRules(int freeUntilAge, int halfPriceUntilAge)
    {
        if (freeUntilAge < 0)
            throw new DomainException("A idade limite para gratuidade não pode ser negativo.");
        if (halfPriceUntilAge <= freeUntilAge)
            throw new DomainException("A idade limite para métade do preço deve ser maior que o limite de gratuidade.");

        FreeUntilAge = freeUntilAge;
        HalfPriceUntilAge = halfPriceUntilAge;
    }

    public decimal CalculateChildWeight(int childAge)
    {
        if (childAge < 0) return 0m;
        if (childAge <= FreeUntilAge) return 0m;
        if (childAge <= HalfPriceUntilAge) return 0.5m;
        return 1m;
    }

    public decimal CalculateChildNightCost(int childAge, decimal perPersonNightPrice)
    {
        var weight = CalculateChildWeight(childAge);
        return decimal.Round(weight * perPersonNightPrice, 2);
    }

    public static ChildrenPricingRules Default() => new(4, 10);
}