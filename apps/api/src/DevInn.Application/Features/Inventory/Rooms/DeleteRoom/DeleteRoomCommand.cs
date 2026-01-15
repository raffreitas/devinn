using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.DeleteRoom;

public sealed record DeleteRoomCommand(Guid Id) : ICommand<Result>
{
    public Validation Validate() => new DeleteRoomValidator().Validate(this).ToFailure();
};

public sealed class DeleteRoomValidator : AbstractValidator<DeleteRoomCommand>
{
    public DeleteRoomValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID do quarto é obrigatório");
    }
}