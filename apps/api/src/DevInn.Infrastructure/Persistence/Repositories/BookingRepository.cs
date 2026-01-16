using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Repositories;

internal sealed class BookingRepository(ApplicationDbContext dbContext) : IBookingRepository
{
    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
        => await dbContext.Bookings.AddAsync(booking, cancellationToken);

    public async Task<Booking?> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken = default)
        => await dbContext.Bookings.FindAsync([bookingId], cancellationToken);

    public async Task<bool> HasOverlappingAsync(Guid roomId, DateTimeOffset checkIn, DateTimeOffset checkOut,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Bookings.AnyAsync(b =>
                b.RoomId == roomId &&
                b.Status != BookingStatus.Canceled &&
                b.StayPeriod.CheckIn < checkOut &&
                b.StayPeriod.CheckOut > checkIn,
            cancellationToken);
    }
}