using DevInn.Domain.Aggregates.Bookings.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.CheckAvailability;

internal sealed class CheckAvailabilityHandler(IBookingRepository bookingRepository)
    : IQueryHandler<CheckAvailabilityQuery, Result<CheckAvailabilityResponse>>
{
    public async ValueTask<Result<CheckAvailabilityResponse>> Handle(CheckAvailabilityQuery query,
        CancellationToken cancellationToken)
    {
        bool hasOverlapping = await bookingRepository.HasOverlappingAsync(
            query.RoomId,
            query.CheckIn,
            query.CheckOut,
            query.ExcludeBookingId,
            cancellationToken);

        return new CheckAvailabilityResponse(!hasOverlapping);
    }
}