using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Commands.Rooms.DeleteRoom;

internal sealed class DeleteRoomHandler(
    IBookingRepository bookingRepository,
    IRoomRepository roomRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteRoomCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteRoomCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();

        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(command.Id, cancellationToken);
        if (room == null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        var hasLinkedBookings = await bookingRepository.HasLinkedRoomBookingsAsync(room.Id, cancellationToken);
        if (hasLinkedBookings)
            return Result.Fail(new ConflictError("Não é possível excluir o quarto porque existem reservas vinculadas."));

        await roomRepository.DeleteAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
