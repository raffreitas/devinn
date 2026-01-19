namespace DevInn.Application.Features.Bookings.Shared;

public sealed record GuestDto(
    string Name,
    string Phone,
    string? Email = null,
    string? Document = null,
    DateOnly? BirthDate = null
);