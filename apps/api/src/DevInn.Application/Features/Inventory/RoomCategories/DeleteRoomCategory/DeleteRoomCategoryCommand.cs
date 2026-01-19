using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;

public sealed record DeleteRoomCategoryCommand(Guid Id) : ICommand<Result>
{
    public Validation Validate() => new DeleteRoomCategoryValidator().Validate(this).ToFailure();
};

public sealed class DeleteRoomCategoryValidator : AbstractValidator<DeleteRoomCategoryCommand>
{
    public DeleteRoomCategoryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID da categoria é obrigatório");
    }
}