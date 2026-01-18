using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Bookings.Shared;

public sealed record PaymentDto(
    Guid Id,
    decimal Amount,
    PaymentMethod Method,
    DateTimeOffset PaymentDate,
    string? Notes
);

public sealed record PricingBreakdown(
    decimal BasePrice,
    decimal ExtraGuestPrice,
    int NumberOfNights,
    int NumberOfExtraGuests,
    decimal Subtotal,
    decimal Discounts,
    decimal Total
);

public sealed record BookingDto(
    Guid Id,
    Guid RoomId,
    string Number,
    string CategoryName,
    GuestDto Guest,
    DateTimeOffset CheckIn,
    DateTimeOffset CheckOut,
    int Adults,
    int Children,
    int[]? ChildrenAges,
    PricingBreakdown Pricing,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    decimal TotalPaid,
    decimal BalanceDue,
    IReadOnlyCollection<PaymentDto> Payments,
    string? Notes
);

internal sealed record BookingProjection(
    Guid Id,
    Guid RoomId,
    int Number,
    string CategoryName,
    decimal BasePrice,
    decimal ExtraPersonPrice,
    string GuestName,
    string GuestPhone,
    string? GuestEmail,
    string? GuestDocument,
    DateOnly? GuestBirthDate,
    DateTime CheckIn,
    DateTime CheckOut,
    int Adults,
    int Children,
    string? ChildrenAges,
    decimal TotalValue,
    decimal PaidValue,
    string Status,
    string? Notes
);

internal sealed record PaymentProjection(
    Guid Id,
    decimal Amount,
    string Method,
    DateTimeOffset PaymentDate,
    string? Notes
);