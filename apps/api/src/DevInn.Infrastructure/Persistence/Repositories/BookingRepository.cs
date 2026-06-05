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

    public Task RemoveAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        dbContext.Bookings.Remove(booking);
        return Task.CompletedTask;
    }

    public async Task<Booking?> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken = default)
        => await dbContext.Bookings
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);

    public async Task<bool> HasLinkedRoomBookingsAsync(Guid roomId, CancellationToken cancellationToken = default)
        => await dbContext.Bookings
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(x => x.RoomId == roomId, cancellationToken);

    public async Task<Booking?> GetByExternalIdAsync(string externalId, CancellationToken cancellationToken = default)
        => await dbContext.Bookings
            .FirstOrDefaultAsync(x => x.ExternalId == externalId, cancellationToken);

    public async Task<IReadOnlyCollection<Booking>> GetByExternalIdsAsync(
        IReadOnlyCollection<string> externalIds,
        CancellationToken cancellationToken = default)
    {
        if (externalIds.Count == 0)
        {
            return [];
        }

        return await dbContext.Bookings
            .Where(x => x.ExternalId != null && externalIds.Contains(x.ExternalId))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Booking>> GetByChannelIntegrationIdAsync(
        Guid channelIntegrationId,
        DateTimeOffset? checkOutAfter = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Bookings
            .Where(b => b.ChannelIntegrationId == channelIntegrationId
                        && b.Status != BookingStatus.Canceled);

        if (checkOutAfter.HasValue)
        {
            query = query.Where(b => b.StayPeriod.CheckOut >= checkOutAfter.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Booking>> GetPotentialOverlapsAsync(
        Guid roomId,
        DateTimeOffset checkIn,
        DateTimeOffset checkOut,
        CancellationToken cancellationToken = default)
    {
        var checkInUtc = checkIn.ToUniversalTime();
        var checkOutUtc = checkOut.ToUniversalTime();

        return await dbContext.Bookings
            .Where(b => b.RoomId == roomId &&
                        b.Status != BookingStatus.Canceled &&
                        b.StayPeriod.CheckIn < checkOutUtc &&
                        b.StayPeriod.CheckOut > checkInUtc)
            .ToListAsync(cancellationToken);
    }

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