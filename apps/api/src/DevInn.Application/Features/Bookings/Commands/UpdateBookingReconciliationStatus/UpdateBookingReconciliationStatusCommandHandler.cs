using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.SeedWork;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.UpdateBookingReconciliationStatus;

internal sealed class UpdateBookingReconciliationStatusCommandHandler(
    IBookingRepository bookingRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateBookingReconciliationStatusCommand, Result>
{
    public async ValueTask<Result> Handle(
        UpdateBookingReconciliationStatusCommand command,
        CancellationToken cancellationToken)
    {
        var booking = await bookingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (booking is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada"));

        if (command.ReconciliationStatus != BookingReconciliationStatus.IgnoredExternalBlock)
            return Result.Fail(new ValidationError("Apenas bloqueios externos podem ser ignorados nesta operação."));

        try
        {
            booking.IgnoreExternalBlock();
        }
        catch (DomainException ex)
        {
            return Result.Fail(new ValidationError(ex.Message));
        }

        await uow.CommitAsync(cancellationToken);
        return Result.Ok();
    }
}
