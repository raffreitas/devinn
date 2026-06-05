namespace DevInn.Domain.Aggregates.Bookings.Abstractions;

public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task RemoveAsync(Booking booking, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task<bool> HasLinkedRoomBookingsAsync(Guid roomId, CancellationToken cancellationToken = default);
    Task<Booking?> GetByExternalIdAsync(string externalId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Booking>> GetByExternalIdsAsync(
        IReadOnlyCollection<string> externalIds,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Booking>> GetByChannelIntegrationIdAsync(
        Guid channelIntegrationId,
        DateTimeOffset? checkOutAfter = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Booking>> GetPotentialOverlapsAsync(
        Guid roomId,
        DateTimeOffset checkIn,
        DateTimeOffset checkOut,
        CancellationToken cancellationToken = default);
    Task<bool> HasOverlappingAsync(Guid roomId, DateTimeOffset checkIn, DateTimeOffset checkOut,
        Guid? excludeBookingId = null,
        CancellationToken cancellationToken = default);
}
