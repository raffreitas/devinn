using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Enums;

using FluentValidation;

namespace DevInn.Application.Features.Inventory.Rooms.UpdateRoom;

public sealed record UpdateRoomInput(
    Guid Id,
    Guid CategoryId,
    int Number,
    string Name,
    RoomStatus Status)
{
    public Validation Validate() => new UpdateRoomValidator().Validate(this).ToFailure();
};

public sealed class UpdateRoomValidator : AbstractValidator<UpdateRoomInput>
{
    public UpdateRoomValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID do quarto é obrigatório");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Number)
            .GreaterThan(0).WithMessage("Número do quarto deve ser maior que 0")
            .LessThanOrEqualTo(999).WithMessage("Número do quarto não pode exceder 999");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome do quarto é obrigatório")
            .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status inválido");
    }
}