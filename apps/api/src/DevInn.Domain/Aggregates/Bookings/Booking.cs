using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Bookings;

public sealed class Booking : Entity
{
    public string GuestName { get; private set; }
    public string Phone { get; set; }
    public string? Email { get; private set; }
    public string? Document { get; private set; }
    public DateOnly? BirthDate { get; private set; }
    public DateOnly CheckIn { get; private set; }
    public DateOnly CheckOut { get; private set; }
    public int Adults { get; private set; }
    public int Children { get; private set; }
    public List<int>? ChildrenAges { get; private set; }
    public string? AgesText { get; private set; }
    public string? Notes { get; private set; }
    public decimal TotalValue { get; private set; }
    public decimal PaidValue { get; private set; }
    public BookingSource Source { get; private set; }
    public bool CancellationStatus { get; private set; }
    public int NumberOfNights => (CheckOut.AddDays(-CheckIn.Day)).Day;
    public decimal BalanceDue => TotalValue - PaidValue;
    public BookingStatus Status => CalculateBookingStatus();

    public PaymentStatus PaymentStatus => PaidValue == 0
        ? PaymentStatus.Pending
        : (PaidValue < TotalValue ? PaymentStatus.Partial : PaymentStatus.Paid);

    private BookingStatus CalculateBookingStatus()
    {
        if (CancellationStatus)
            return BookingStatus.Cancelled;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (today < CheckIn)
            return BookingStatus.Scheduled;
        if (today >= CheckIn && today < CheckOut)
            return BookingStatus.CheckedIn;

        return BookingStatus.Completed;
    }
}