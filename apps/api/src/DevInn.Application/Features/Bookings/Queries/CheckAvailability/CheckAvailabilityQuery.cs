using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.CheckAvailability;

public sealed record CheckAvailabilityQuery(
    Guid RoomId,
    DateTimeOffset CheckIn,
    DateTimeOffset CheckOut,
    Guid? ExcludeBookingId)
    : IQuery<Result<CheckAvailabilityResponse>>;