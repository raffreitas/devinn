using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Bookings.ValueObjects;

public record Guest(
    string Name,
    string Phone,
    string? Email = null,
    string? Document = null,
    DateOnly? BirthDate = null
) : IValueObject;