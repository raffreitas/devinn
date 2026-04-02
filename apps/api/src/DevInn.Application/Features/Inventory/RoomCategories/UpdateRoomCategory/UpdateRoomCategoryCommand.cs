using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inventory.RoomCategories.UpdateRoomCategory;

public sealed record UpdateRoomCategoryCommand(
    Guid Id,
    string Name,
    int Capacity,
    string Description,
    decimal BasePrice,
    decimal ExtraPersonPrice) : ICommand<Result>
{
    public Validation Validate() => new UpdateRoomCategoryValidator().Validate(this).ToFailure();
};

public sealed class UpdateRoomCategoryValidator : AbstractValidator<UpdateRoomCategoryCommand>
{
    public UpdateRoomCategoryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID da categoria é obrigatório");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome da categoria é obrigatório")
            .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacidade deve ser maior que 0")
            .LessThanOrEqualTo(10).WithMessage("Capacidade máxima é 10 pessoas");

        When(x => !string.IsNullOrEmpty(x.Description), () =>
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Descrição não pode ter mais de 500 caracteres"));

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Preço base deve ser maior que 0");

        RuleFor(x => x.ExtraPersonPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Preço de pessoa extra não pode ser negativo");
    }
}