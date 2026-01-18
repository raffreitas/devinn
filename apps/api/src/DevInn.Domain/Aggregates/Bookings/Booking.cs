using DevInn.Domain.Aggregates.Bookings.Entities;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Bookings;

public sealed class Booking : Entity
{
    private readonly List<Payment> _payments = [];

    public Guid RoomId { get; private set; }
    public Guest Guest { get; private set; } = null!;
    public StayPeriod StayPeriod { get; private set; }
    public Occupancy Occupancy { get; private set; } = null!;
    public string? Notes { get; private set; }
    public Money TotalValue { get; private set; }
    public BookingSource Source { get; private set; }
    public BookingStatus Status { get; private set; }
    public IReadOnlyCollection<Payment> Payments => _payments.AsReadOnly();
    public int NumberOfNights => StayPeriod.TotalNights();
    public Money PaidValue => new(_payments.Sum(p => p.Amount.Value));
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
        BookingSource source,
        string? notes = null)
    {
        Guest = guest;
        StayPeriod = stayPeriod;
        Occupancy = occupancy;
        Notes = notes;
        TotalValue = totalValue;
        Source = source;
        RoomId = roomId;
        Status = BookingStatus.Scheduled;
    }

    public void Update(
        Guid roomId,
        Guest guest,
        StayPeriod stayPeriod,
        Occupancy occupancy,
        Money totalValue,
        BookingSource source,
        string? notes = null)
    {
        if (Status == BookingStatus.Canceled || Status == BookingStatus.CheckedIn || Status == BookingStatus.Completed)
            throw new DomainException("Não é possível alterar uma reserva que não está em estado agendado.");

        RoomId = roomId;
        Guest = guest;
        StayPeriod = stayPeriod;
        Occupancy = occupancy;
        Notes = notes;
        TotalValue = totalValue;
        Source = source;
    }

    public void AddPayment(Money amount, PaymentMethod method, DateTimeOffset paymentDate, string? notes = null)
    {
        if (amount <= 0)
            throw new DomainException("O valor do pagamento deve ser maior que zero.");

        var payment = new Payment(Id, amount, method, paymentDate, notes);
        _payments.Add(payment);
    }

    public void ClearPayments()
    {
        _payments.Clear();
    }

    private PaymentStatus CalculatePaymentStatus()
    {
        if (PaidValue == 0) return PaymentStatus.Pending;
        return PaidValue < TotalValue ? PaymentStatus.Partial : PaymentStatus.Paid;
    }
}