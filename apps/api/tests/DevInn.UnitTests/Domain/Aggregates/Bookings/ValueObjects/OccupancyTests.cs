using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Bookings.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class OccupancyTests
{
    [Fact]
    public void Constructor_ShouldCreateOccupancy_WhenValidData()
    {
        var occupancy = new Occupancy(2, 2, [4, 9]);

        occupancy.Adults.ShouldBe(2);
        occupancy.Children.ShouldBe(2);
        occupancy.ChildrenAges.Count.ShouldBe(2);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenAdultsIsLessThanOne()
    {
        Should.Throw<DomainException>(() => new Occupancy(0, 1, [7]))
            .Message.ShouldBe("Deve haver pelo menos um adulto na ocupação.");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenChildrenAgesCountDiffers()
    {
        Should.Throw<DomainException>(() => new Occupancy(1, 2, [5]))
            .Message.ShouldBe("A lista de idades das crianças deve corresponder ao número de crianças.");
    }
}
