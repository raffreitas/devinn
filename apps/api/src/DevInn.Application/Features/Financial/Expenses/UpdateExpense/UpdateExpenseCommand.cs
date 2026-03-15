using DevInn.Application.Common.Validation;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.UpdateExpense;

public sealed record UpdateExpenseCommand(
    Guid Id,
    Guid CategoryId,
    string Description,
    decimal Amount,
    PaymentMethod PaymentMethod,
    DateOnly DueDate,
    DateOnly? PaymentDate = null
) : ICommand<Result>
{
    public Validation Validate() => new UpdateExpenseValidator().Validate(this).ToFailure();
}

public sealed class UpdateExpenseValidator : AbstractValidator<UpdateExpenseCommand>
{
    public UpdateExpenseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID da despesa é obrigatório");
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição não pode ter mais de 500 caracteres");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow)).WithMessage("Data de vencimento inválida");
    }
}