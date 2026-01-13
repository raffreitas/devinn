using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.RoomCategories.CreateRoomCategory;

public interface ICreateRoomCategoryUseCase : IUseCase<CreateRoomCategoryInput, Result<Guid>>;

internal sealed class CreateRoomCategoryUseCase(
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow
) : ICreateRoomCategoryUseCase
{
    public async ValueTask<Result<Guid>> ExecuteAsync(
        CreateRoomCategoryInput input,
        CancellationToken cancellationToken = default)
    {
        var validation = input.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var existingCategory = await categoryRepository.GetByNameAsync(
            input.Name,
            cancellationToken);

        if (existingCategory != null)
            return Result.Fail(new ConflictError("Uma categoria com este nome já existe para esta pousada"));

        var category = new RoomCategory(
            input.Name,
            input.Description,
            input.Capacity,
            input.BasePrice,
            input.ExtraPersonPrice);

        await categoryRepository.AddAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(category.Id);
    }
}