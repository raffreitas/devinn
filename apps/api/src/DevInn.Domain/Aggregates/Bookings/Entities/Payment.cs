using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Bookings.Entities;

public sealed class Payment : Entity
{
    public Guid BookingId { get; private set; }
    public Money Amount { get; private set; }
    public PaymentMethod Method { get; private set; }
    public DateTimeOffset PaymentDate { get; private set; }
    public string? Notes { get; private set; }

    private Payment()
    {
    }

    public Payment(Guid bookingId, Money amount, PaymentMethod method, DateTimeOffset paymentDate, string? notes = null)
    {
        if (amount <= 0)
            throw new DomainException("O valor do pagamento deve ser maior que zero.");

        BookingId = bookingId;
        Amount = amount;
        Method = method;
        PaymentDate = paymentDate;
        Notes = notes;
    }
}