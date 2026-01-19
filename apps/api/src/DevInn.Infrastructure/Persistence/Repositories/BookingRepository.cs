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
        => await dbContext.Bookings
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);

    public async Task<bool> HasOverlappingAsync(Guid roomId, DateTimeOffset checkIn, DateTimeOffset checkOut,
        Guid? excludeBookingId = null,
        CancellationToken cancellationToken = default)
    {
        // PostgreSQL requires UTC for timestamp with time zone
        var checkInUtc = checkIn.ToUniversalTime();
        var checkOutUtc = checkOut.ToUniversalTime();

        return await dbContext.Bookings.AsNoTracking().AnyAsync(b =>
                b.RoomId == roomId &&
                (excludeBookingId == null || b.Id != excludeBookingId) &&
                b.Status != BookingStatus.Canceled &&
                b.StayPeriod.CheckIn < checkOutUtc &&
                b.StayPeriod.CheckOut > checkInUtc,
            cancellationToken);
    }
}