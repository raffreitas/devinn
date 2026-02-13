using DevInn.Domain.Aggregates.Bookings.Services;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;
using DevInn.UnitTests.Shared.DataBuilders.Inventory;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Bookings.Services;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class PricingCalculatorServiceTests
{
    private readonly PricingCalculatorService _sut = new();

    [Fact]
    public void CalculateBreakdown_ShouldReturnsCorrectTotal_When2Adults3Nights()
    {
        // Arrange
        var stayPeriod = new StayPeriod(
            new DateTimeOffset(2026, 1, 24, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 27, 0, 0, 0, TimeSpan.Zero)
        );

        var roomCategory = new RoomCategoryDataBuilder()
            .WithMaxCapacity(2)
            .WithPricingPolicy(new PricingPolicy(basePrice: 200m, personPrice: 50m))
            .Build();

        var occupancy = new Occupancy(2, 0);

        // Act
        var breakdown = _sut.CalculateBreakdown(stayPeriod, roomCategory, occupancy);

        // Assert
        breakdown.BasePrice.Value.ShouldBe(200m);
        breakdown.DailyTotal.Value.ShouldBe(200m);
        breakdown.Nights.ShouldBe(3);
        breakdown.Total.Value.ShouldBe(600m);
    }

    [Fact]
    public void CalculateBreakdown_ShouldChargesPerPersonPrice_When3Adults2Nights()
    {
        // Arrange
        var stayPeriod = new StayPeriod(
            new DateTimeOffset(2026, 1, 24, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 26, 0, 0, 0, TimeSpan.Zero)
        );
        var roomCategory = new RoomCategoryDataBuilder()
            .WithMaxCapacity(3)
            .WithPricingPolicy(new PricingPolicy(basePrice: 200m, personPrice: 50m, includedOccupants: 2))
            .Build();

        var occupancy = new Occupancy(3, 0);

        // Act
        var breakdown = _sut.CalculateBreakdown(stayPeriod, roomCategory, occupancy);

        // Assert
        // 3 unidades * 50 = 150 por dia
        breakdown.DailyTotal.Value.ShouldBe(150m);
        breakdown.Total.Value.ShouldBe(300m); // 150 * 2 noites
    }

    [Fact]
    public void CalculateBreakdown_ShouldThrowsException_WhenSameDayCheckIn()
    {
        // Arrange
        var date = new DateTimeOffset(2026, 1, 24, 0, 0, 0, TimeSpan.Zero);

        // Act & Assert
        Should.Throw<DomainException>(() =>
        {
            var stayPeriod = new StayPeriod(date, date);
            var roomCategory = new RoomCategoryDataBuilder()
                .WithMaxCapacity(2)
                .WithPricingPolicy(new PricingPolicy(basePrice: 200m, personPrice: 50m))
                .Build();
            var occupancy = new Occupancy(1, 0);
            _sut.CalculateBreakdown(stayPeriod, roomCategory, occupancy);
        });
    }
}