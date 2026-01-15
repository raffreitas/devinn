using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.UpdateRoom;

internal sealed class UpdateRoomHandler(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateRoomCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateRoomCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(command.Id, cancellationToken);
        if (room == null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        // Verify category exists 
        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if new room number is unique (excluding current room)
        var isUnique = await roomRepository.IsNumberUniqueAsync(
            command.Number,
            command.Id,
            cancellationToken);

        if (!isUnique)
            return Result.Fail(new ConflictError("Já existe um quarto com este número nesta pousada"));

        room.Update(command.CategoryId, command.Number, command.Name, command.Status);

        await roomRepository.UpdateAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}