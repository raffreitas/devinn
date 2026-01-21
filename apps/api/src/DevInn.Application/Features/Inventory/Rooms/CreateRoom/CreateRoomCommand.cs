using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.CreateRoom;

public sealed record CreateRoomCommand(
    Guid CategoryId,
    int Number,
    string? Name,
    RoomStatus? Status) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateRoomValidator().Validate(this).ToFailure();
};

public sealed class CreateRoomValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Number)
            .GreaterThan(0).WithMessage("Número do quarto deve ser maior que 0")
            .LessThanOrEqualTo(999).WithMessage("Número do quarto não pode exceder 999");

        When(x => x.Status != null, () =>
        {
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Status do quarto inválido");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name)
                .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");
        });
    }
}