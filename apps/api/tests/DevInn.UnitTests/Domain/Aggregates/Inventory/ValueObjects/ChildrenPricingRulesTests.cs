using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ChildrenPricingRulesTests
{
    [Fact]
    public void Constructor_ShouldThrowsException_WhenHalfPriceNotGreaterThanFree()
    {
        // Act & Assert
        Should.Throw<DomainException>(() => new ChildrenPricingRules(5, 5)).Message
            .ShouldBe("A idade limite para métade do preço deve ser maior que o limite de gratuidade.");
    }

    [Fact]
    public void CalculateChildWeight_ShouldReturnsZero_WhenAgeLessThanFreeUntilAge()
    {
        // Arrange
        var rules = ChildrenPricingRules.Default(); // (4, 10)

        // Act
        var weight = rules.CalculateChildWeight(3);

        // Assert
        weight.ShouldBe(0m);
    }

    [Fact]
    public void CalculateChildWeight_ShouldReturnsHalf_WhenAgeBetweenFreeAndHalf()
    {
        // Arrange
        var rules = ChildrenPricingRules.Default(); // (4, 10)

        // Act
        var weight = rules.CalculateChildWeight(7);

        // Assert
        weight.ShouldBe(0.5m);
    }

    [Fact]
    public void CalculateChildWeight_ShouldReturnsOne_WhenAgeAboveHalfPrice()
    {
        // Arrange
        var rules = ChildrenPricingRules.Default(); // (4, 10)

        // Act
        var weight = rules.CalculateChildWeight(15);

        // Assert
        weight.ShouldBe(1m);
    }

    [Fact]
    public void CalculateChildNightCost_ShouldReturnsHalfPrice_WhenChild5YearsOld()
    {
        // Arrange
        var rules = ChildrenPricingRules.Default();
        const decimal perPersonPrice = 100m;

        // Act
        var cost = rules.CalculateChildNightCost(5, perPersonPrice);

        // Assert
        cost.ShouldBe(50m);
    }
}