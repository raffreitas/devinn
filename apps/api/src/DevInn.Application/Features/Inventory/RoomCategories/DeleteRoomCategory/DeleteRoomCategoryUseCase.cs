using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;

public interface IDeleteRoomCategoryUseCase : IUseCase<DeleteRoomCategoryInput, Result>;

internal sealed class DeleteRoomCategoryUseCase(
    IRoomCategoryRepository categoryRepository,
    IRoomRepository roomRepository,
    IUnitOfWork uow) : IDeleteRoomCategoryUseCase
{
    public async ValueTask<Result> ExecuteAsync(
        DeleteRoomCategoryInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(input.Id, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if there are rooms linked to this category
        var linkedRooms = await roomRepository.GetAllByCategoryAsync(input.Id, cancellationToken);
        if (linkedRooms.Count != 0)
            return Result.Fail(
                new ValidationError("Não é possível excluir uma categoria que possui quartos vinculados"));

        await categoryRepository.RemoveAsync(category);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}