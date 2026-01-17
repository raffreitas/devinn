using DevInn.Application.Features.Bookings.Shared;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.GetBookingById;

public sealed record GetBookingByIdQuery(Guid Id) : IQuery<Result<BookingDto>>;