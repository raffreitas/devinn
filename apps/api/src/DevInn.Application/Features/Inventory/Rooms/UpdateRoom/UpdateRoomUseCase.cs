using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.Rooms.UpdateRoom;

public interface IUpdateRoomUseCase : IUseCase<UpdateRoomInput, Result>;

internal sealed class UpdateRoomUseCase(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow) : IUpdateRoomUseCase
{
    public async ValueTask<Result> ExecuteAsync(
        UpdateRoomInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(input.Id, cancellationToken);
        if (room == null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        // Verify category exists 
        var category = await categoryRepository.GetByIdAsync(input.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if new room number is unique (excluding current room)
        var isUnique = await roomRepository.IsNumberUniqueAsync(
            input.Number,
            input.Id,
            cancellationToken);

        if (!isUnique)
            return Result.Fail(new ConflictError("Já existe um quarto com este número nesta pousada"));

        room.Update(input.CategoryId, input.Number, input.Name, input.Status);

        await roomRepository.UpdateAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}