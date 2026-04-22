using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Commands.RoomCategories.UpdateRoomCategory;

internal sealed class UpdateRoomCategoryHandler(IRoomCategoryRepository categoryRepository, IUnitOfWork uow)
    : ICommandHandler<UpdateRoomCategoryCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateRoomCategoryCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();

        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria não encontrada"));

        // Check if another category with this name exists
        var existingCategory = await categoryRepository.GetByNameAsync(
            command.Name,
            cancellationToken);
        if (existingCategory != null && existingCategory.Id != command.Id)
            return Result.Fail(new ConflictError("Uma categoria com este nome já existe para esta pousada"));

        category.Update(
            command.Name,
            command.Capacity,
            command.Description,
            command.BasePrice,
            command.ExtraPersonPrice);
        await categoryRepository.UpdateAsync(category, cancellationToken);

        await uow.CommitAsync(cancellationToken);
        return Result.Ok();
    }
}
