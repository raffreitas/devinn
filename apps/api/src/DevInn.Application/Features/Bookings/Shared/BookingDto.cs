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

public sealed record AuditSummaryDto(
    string Action,
    DateTimeOffset OccurredAt,
    string Summary
);

public sealed record BookingDto(
    Guid Id,
    Guid RoomId,
    string Number,
    string CategoryName,
    GuestDto? Guest,
    BookingSource Source,
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
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    AuditSummaryDto? LastAudit
);

internal sealed record BookingProjection
{
    public Guid Id { get; init; }
    public Guid RoomId { get; init; }
    public int Number { get; init; }
    public string CategoryName { get; init; } = null!;
    public decimal BasePrice { get; init; }
    public decimal ExtraPersonPrice { get; init; }
    public string? GuestName { get; init; }
    public string? GuestPhone { get; init; }
    public string? GuestEmail { get; init; }
    public string? GuestDocument { get; init; }
    public DateOnly? GuestBirthDate { get; init; }
    public DateTime CheckIn { get; init; }
    public DateTime CheckOut { get; init; }
    public int Adults { get; init; }
    public int Children { get; init; }
    public string? ChildrenAges { get; init; }
    public decimal TotalValue { get; init; }
    public string Status { get; init; } = null!;
    public string Source { get; init; } = null!;
    public string? Notes { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

internal sealed record PaymentProjection
{
    public Guid Id { get; init; }
    public decimal Amount { get; init; }
    public string Method { get; init; } = null!;
    public DateTimeOffset PaymentDate { get; init; }
    public string? Notes { get; init; }
}

internal sealed record AuditLogProjection
{
    public Guid EntityId { get; init; }
    public string Action { get; init; } = null!;
    public DateTimeOffset OccurredAt { get; init; }
    public string Summary { get; init; } = null!;
}
