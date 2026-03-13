using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Bookings.Services;

public sealed class PricingCalculatorService : IPricingCalculatorService
{
    public PricingBreakdown CalculateBreakdown(StayPeriod stayPeriod, RoomCategory roomCategory, Occupancy occupancy)
    {
        if (stayPeriod.Equals(default)) throw new DomainException("O período de estadia não pode ser nulo.");
        DomainException.ThrowIfNull(roomCategory, "O categoria de quarto não pode ser nula.");
        DomainException.ThrowIfNull(occupancy, "A ocupação não pode ser nula.");

        var nights = stayPeriod.TotalNights();
        if (nights <= 0)
            throw new DomainException("O período de estadia deve ter pelo menos uma noite.");

        var pricing = roomCategory.PricingPolicy;
        (decimal payingUnits, decimal childrenCostPerNight) = pricing.CalculateOccupancyCharges(occupancy);

        var dailyRate = pricing.CalculateDailyRate(payingUnits);

        var dailyTotal = decimal.Round(dailyRate, 2);
        var childrenCostTotal = decimal.Round(childrenCostPerNight * nights, 2);
        var total = decimal.Round((dailyRate * nights), 2);

        return new PricingBreakdown(
            BasePrice: new Money(decimal.Round(pricing.BasePrice, 2)),
            PerPersonPrice: new Money(decimal.Round(pricing.PersonPrice, 2)),
            PayingUnits: payingUnits,
            ChildrenCost: new Money(childrenCostTotal),
            DailyTotal: new Money(dailyTotal),
            Nights: nights,
            Total: new Money(total)
        );
    }
}