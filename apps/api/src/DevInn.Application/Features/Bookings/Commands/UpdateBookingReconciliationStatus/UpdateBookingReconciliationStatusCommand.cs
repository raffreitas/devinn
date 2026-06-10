using DevInn.Domain.Aggregates.Bookings.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.UpdateBookingReconciliationStatus;

public sealed record UpdateBookingReconciliationStatusCommand(
    Guid Id,
    BookingReconciliationStatus ReconciliationStatus
) : ICommand<Result>;
