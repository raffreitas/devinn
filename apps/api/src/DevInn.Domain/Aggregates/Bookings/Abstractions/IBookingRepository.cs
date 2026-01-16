namespace DevInn.Domain.Aggregates.Bookings.Abstractions;

public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken = default);
}