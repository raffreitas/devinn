namespace DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;

public sealed record PriceBreakdownDto(
    decimal BasePrice,
    decimal PerPersonPrice,
    decimal PayingUnits,
    decimal ChildrenCost,
    decimal DailyTotal,
    int Nights,
    decimal Total
);