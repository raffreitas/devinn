using DevInn.Application.Common.Validation;

using FluentValidation;

namespace DevInn.Application.Features.Inventory.RoomCategories.CreateRoomCategory;

public sealed record CreateRoomCategoryInput(
    string Name,
    int Capacity,
    string Description,
    decimal BasePrice,
    decimal ExtraPersonPrice)
{
    public Validation Validate() => new CreateRoomCategoryValidator().Validate(this).ToFailure();
};

public sealed class CreateRoomCategoryValidator : AbstractValidator<CreateRoomCategoryInput>
{
    public CreateRoomCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome da categoria é obrigatório")
            .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacidade deve ser maior que 0")
            .LessThanOrEqualTo(10).WithMessage("Capacidade máxima é 10 pessoas");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Descrição não pode ter mais de 500 caracteres");

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Preço base deve ser maior que 0");

        RuleFor(x => x.ExtraPersonPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Preço de pessoa extra não pode ser negativo");
    }
}