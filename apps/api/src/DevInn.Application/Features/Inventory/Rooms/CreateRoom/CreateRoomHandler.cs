using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.CreateRoom;

internal sealed class CreateRoomHandler(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<CreateRoomCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateRoomCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();

        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        var isUnique = await roomRepository.IsNumberUniqueAsync(
            command.Number,
            cancellationToken: cancellationToken);

        if (!isUnique)
            return Result.Fail(new ConflictError("Já existe um quarto com este número nesta pousada"));

        var room = new Room(command.CategoryId, command.Number, command.Name);
        await roomRepository.AddAsync(room, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(room.Id);
    }
}