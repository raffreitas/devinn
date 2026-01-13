using DevInn.Application.Common.Validation;

using FluentValidation;

namespace DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;

public sealed record DeleteRoomCategoryInput(Guid Id)
{
    public Validation Validate() => new DeleteRoomCategoryValidator().Validate(this).ToFailure();
};

public sealed class DeleteRoomCategoryValidator : AbstractValidator<DeleteRoomCategoryInput>
{
    public DeleteRoomCategoryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID da categoria é obrigatório");
    }
}