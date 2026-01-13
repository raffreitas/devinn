using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.Rooms.DeleteRoom;

public interface IDeleteRoomUseCase : IUseCase<DeleteRoomInput, Result>;

internal sealed class DeleteRoomUseCase(
    IRoomRepository roomRepository,
    IUnitOfWork uow) : IDeleteRoomUseCase
{
    public async ValueTask<Result> ExecuteAsync(
        DeleteRoomInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();

        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(input.Id, cancellationToken);
        if (room == null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        // TODO: Check if there are reservations linked to this room
        // For now, we'll allow deletion

        await roomRepository.DeleteAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}