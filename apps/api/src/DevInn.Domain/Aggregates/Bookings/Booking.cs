using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Bookings;

public sealed class Booking : Entity
{
    public Guid RoomId { get; private set; }
    public Guest Guest { get; private set; } = null!;
    public StayPeriod StayPeriod { get; private set; }
    public Occupancy Occupancy { get; private set; } = null!;
    public string? Notes { get; private set; }
    public Money TotalValue { get; private set; }
    public Money PaidValue { get; private set; }
    public BookingSource Source { get; private set; }
    public BookingStatus Status { get; private set; }
    public int NumberOfNights => StayPeriod.TotalNights();
    public decimal BalanceDue => TotalValue - PaidValue;
    public PaymentStatus PaymentStatus => CalculatePaymentStatus();

    private Booking()
    {
    }

    public Booking(
        Guid roomId,
        Guest guest,
        StayPeriod stayPeriod,
        Occupancy occupancy,
        Money totalValue,
        Money paidValue,
        BookingSource source,
        string? notes = null)
    {
        Guest = guest;
        StayPeriod = stayPeriod;
        Occupancy = occupancy;
        Notes = notes;
        TotalValue = totalValue;
        PaidValue = paidValue;
        Source = source;
        RoomId = roomId;
        Status = BookingStatus.Scheduled;
    }

    private PaymentStatus CalculatePaymentStatus()
    {
        if (PaidValue == 0) return PaymentStatus.Pending;
        return PaidValue < TotalValue ? PaymentStatus.Partial : PaymentStatus.Paid;
    }
}