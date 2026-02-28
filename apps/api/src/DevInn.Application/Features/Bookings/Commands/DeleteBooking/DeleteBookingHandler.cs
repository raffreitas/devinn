using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Domain.Aggregates.Bookings.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.DeleteBooking;

internal sealed class DeleteBookingHandler(IBookingRepository bookingRepository, IUnitOfWork uow)
    : ICommandHandler<DeleteBookingCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteBookingCommand command, CancellationToken cancellationToken)
    {
        var booking = await bookingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (booking is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada."));

        await bookingRepository.RemoveAsync(booking, cancellationToken);

        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}