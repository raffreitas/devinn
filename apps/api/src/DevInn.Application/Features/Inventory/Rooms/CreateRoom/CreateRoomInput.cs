using DevInn.Application.Common.Validation;

using FluentValidation;

namespace DevInn.Application.Features.Inventory.Rooms.CreateRoom;

public sealed record CreateRoomInput(
    Guid CategoryId,
    int Number,
    string Name)
{
    public Validation Validate() => new CreateRoomValidator().Validate(this).ToFailure();
};

public sealed class CreateRoomValidator : AbstractValidator<CreateRoomInput>
{
    public CreateRoomValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Number)
            .GreaterThan(0).WithMessage("Número do quarto deve ser maior que 0")
            .LessThanOrEqualTo(999).WithMessage("Número do quarto não pode exceder 999");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome do quarto é obrigatório")
            .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");
    }
}