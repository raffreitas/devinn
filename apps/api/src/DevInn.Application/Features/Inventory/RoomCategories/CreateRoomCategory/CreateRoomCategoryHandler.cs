using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.RoomCategories.CreateRoomCategory;

internal sealed class CreateRoomCategoryHandler(
    IRoomCategoryRepository categoryRepository,
    IUnitOfWork uow
) : ICommandHandler<CreateRoomCategoryCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateRoomCategoryCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var existingCategory = await categoryRepository.GetByNameAsync(
            command.Name,
            cancellationToken);

        if (existingCategory != null)
            return Result.Fail(new ConflictError("Uma categoria com este nome já existe para esta pousada"));

        var category = new RoomCategory(
            command.Name,
            command.Description,
            command.Capacity,
            new PricingPolicy(command.BasePrice, command.ExtraPersonPrice)
        );

        await categoryRepository.AddAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(category.Id);
    }
}