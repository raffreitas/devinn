using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.DeleteBooking;

internal sealed class DeleteBookingHandler(IBookingRepository bookingRepository, IUserContext userContext, IUnitOfWork uow)
    : ICommandHandler<DeleteBookingCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteBookingCommand command, CancellationToken cancellationToken)
    {
        var booking = await bookingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (booking is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada."));

        booking.SoftDelete(userContext.UserId);

        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
