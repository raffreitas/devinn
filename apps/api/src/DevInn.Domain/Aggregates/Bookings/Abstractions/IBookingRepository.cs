namespace DevInn.Domain.Aggregates.Bookings.Abstractions;

public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task RemoveAsync(Booking booking, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken = default);

    Task<bool> HasOverlappingAsync(Guid roomId, DateTimeOffset checkIn, DateTimeOffset checkOut,
        Guid? excludeBookingId = null,
        CancellationToken cancellationToken = default);
}