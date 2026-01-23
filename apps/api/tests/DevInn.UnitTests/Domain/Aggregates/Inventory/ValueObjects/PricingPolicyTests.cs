using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class PricingPolicyTests
{
    [Fact]
    public void CalculateDailyRate_ShouldReturnsBasePrice_WhenPayingUnitsLessThanIncluded()
    {
        // Arrange
        var policy = new PricingPolicy(200m, 50m, includedOccupants: 2);

        // Act
        var rate = policy.CalculateDailyRate(1.5m);

        // Assert
        rate.ShouldBe(200m);
    }

    [Fact]
    public void CalculateDailyRate_ShouldReturnsPerPersonPrice_WhenPayingUnitsMoreThanIncluded()
    {
        // Arrange
        var policy = new PricingPolicy(200m, 50m, includedOccupants: 2);

        // Act
        var rate = policy.CalculateDailyRate(3m);

        // Assert
        rate.ShouldBe(150m); // 50 * 3
    }

    [Fact]
    public void CalculateOccupancyCharges_ShouldReturns2PayingUnits_When2AdultsNoChildren()
    {
        // Arrange
        var policy = new PricingPolicy(200m, 50m);
        var occupancy = new Occupancy(2, 0);

        // Act
        (decimal payingUnits, decimal childrenCost) = policy.CalculateOccupancyCharges(occupancy);

        // Assert
        payingUnits.ShouldBe(2m);
        childrenCost.ShouldBe(0m);
    }

    [Fact]
    public void CalculateOccupancyCharges_ShouldReturnsValidValues_When2AdultsPlus2ChildrenMixedAges()
    {
        // Arrange
        var policy = new PricingPolicy(200m, 50m);
        var occupancy = new Occupancy(2, 2, [3, 7]); // 1 grátis, 1 meia

        // Act
        (decimal payingUnits, decimal childrenCost) = policy.CalculateOccupancyCharges(occupancy);

        // Assert
        payingUnits.ShouldBe(2.5m); // 2 + 0 + 0.5
        childrenCost.ShouldBe(25m); // 0 + (50 * 0.5)
    }

    [Fact]
    public void Constructor_NegativeBasePrice_ThrowsException()
    {
        // Act & Assert
        Should.Throw<DomainException>(() => new PricingPolicy(-100m, 50m))
            .Message.ShouldBe("Preço base não pode ser negativo.");
    }
}