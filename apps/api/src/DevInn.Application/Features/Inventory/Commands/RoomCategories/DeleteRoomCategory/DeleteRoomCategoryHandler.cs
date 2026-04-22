using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Commands.RoomCategories.DeleteRoomCategory;

internal sealed class DeleteRoomCategoryHandler(
    IRoomCategoryRepository categoryRepository,
    IRoomRepository roomRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteRoomCategoryCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteRoomCategoryCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if there are rooms linked to this category
        var linkedRooms = await roomRepository.GetAllByCategoryAsync(command.Id, cancellationToken);
        if (linkedRooms.Count != 0)
            return Result.Fail(
                new ValidationError("Não é possível excluir uma categoria que possui quartos vinculados"));

        await categoryRepository.RemoveAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
