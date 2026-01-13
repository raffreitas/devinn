using DevInn.Application.Common.Validation;

using FluentValidation;

namespace DevInn.Application.Features.Inventory.Rooms.DeleteRoom;

public sealed record DeleteRoomInput(Guid Id)
{
    public Validation Validate() => new DeleteRoomValidator().Validate(this).ToFailure();
};

public sealed class DeleteRoomValidator : AbstractValidator<DeleteRoomInput>
{
    public DeleteRoomValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID do quarto é obrigatório");
    }
}