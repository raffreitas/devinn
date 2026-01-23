using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Bookings.Abstractions;

public sealed record PricingBreakdown(
    Money BasePrice,
    Money PerPersonPrice,
    decimal PayingUnits,
    Money ChildrenCost,
    Money DailyTotal,
    int Nights,
    Money Total
);

public interface IPricingCalculatorService
{
    PricingBreakdown CalculateBreakdown(
        StayPeriod stayPeriod,
        RoomCategory roomCategory,
        Occupancy occupancy
    );
}