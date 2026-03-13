using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Bookings.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class StayPeriodTests
{
    [Fact]
    public void Constructor_ShouldCreateStayPeriod_WhenCheckOutAfterCheckIn()
    {
        var stay = new StayPeriod(
            new DateTimeOffset(2026, 1, 10, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 12, 0, 0, 0, TimeSpan.Zero));

        stay.TotalNights().ShouldBe(2);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenCheckOutIsBeforeOrEqualToCheckIn()
    {
        Should.Throw<DomainException>(() => new StayPeriod(
                new DateTimeOffset(2026, 1, 10, 0, 0, 0, TimeSpan.Zero),
                new DateTimeOffset(2026, 1, 10, 0, 0, 0, TimeSpan.Zero)))
            .Message.ShouldBe("A data de check-out deve ser posterior à data de check-in.");
    }
}