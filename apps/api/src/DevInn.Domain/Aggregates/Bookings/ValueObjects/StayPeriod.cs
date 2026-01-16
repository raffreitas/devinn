using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Bookings.ValueObjects;

public readonly record struct StayPeriod : IValueObject
{
    public DateTimeOffset CheckIn { get; private init; }
    public DateTimeOffset CheckOut { get; private init; }

    public StayPeriod(DateTimeOffset checkIn, DateTimeOffset checkOut)
    {
        if (checkOut <= checkIn)
            throw new DomainException("A data de check-out deve ser posterior à data de check-in.");
        CheckIn = checkIn;
        CheckOut = checkOut;
    }

    public int TotalNights() => (CheckOut.Date - CheckIn.Date).Days;
}