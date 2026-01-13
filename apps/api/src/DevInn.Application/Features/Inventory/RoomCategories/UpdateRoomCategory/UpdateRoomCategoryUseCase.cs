using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.RoomCategories.UpdateRoomCategory;

public interface IUpdateRoomCategoryUseCase : IUseCase<UpdateRoomCategoryInput, Result>;

internal sealed class UpdateRoomCategoryUseCase(IRoomCategoryRepository categoryRepository, IUnitOfWork uow)
    : IUpdateRoomCategoryUseCase
{
    public async ValueTask<Result> ExecuteAsync(
        UpdateRoomCategoryInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();

        if (validation.IsFailure)
        {
            return Result.Fail(validation.ToError());
        }

        var category = await categoryRepository.GetByIdAsync(input.Id, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if another category with this name exists
        var existingCategory = await categoryRepository.GetByNameAsync(
            input.Name,
            cancellationToken);

        if (existingCategory != null && existingCategory.Id != input.Id)
            return Result.Fail(new ConflictError("Uma categoria com este nome já existe para esta pousada"));

        category.Update(input.Name, input.Capacity, input.Description);
        await categoryRepository.UpdateAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}