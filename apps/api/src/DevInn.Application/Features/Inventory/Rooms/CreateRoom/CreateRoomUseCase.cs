using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.Rooms.CreateRoom;

public interface ICreateRoomUseCase : IUseCase<CreateRoomInput, Result<Guid>>;

internal sealed class CreateRoomUseCase(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICreateRoomUseCase
{
    public async ValueTask<Result<Guid>> ExecuteAsync(
        CreateRoomInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();

        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(input.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        var isUnique = await roomRepository.IsNumberUniqueAsync(
            input.Number,
            cancellationToken: cancellationToken);

        if (!isUnique)
            return Result.Fail(new ConflictError("Já existe um quarto com este número nesta pousada"));

        var room = new Room(input.CategoryId, input.Number, input.Name);
        await roomRepository.AddAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(room.Id);
    }
}