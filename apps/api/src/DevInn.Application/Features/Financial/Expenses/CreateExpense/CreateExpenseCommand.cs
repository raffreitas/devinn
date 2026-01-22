using DevInn.Application.Common.Validation;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;
using FluentResults;
using FluentValidation;
using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.CreateExpense;

public sealed record CreateExpenseCommand(
    Guid CategoryId,
    string Description,
    decimal Amount,
    PaymentMethod PaymentMethod,
    DateOnly DueDate,
    DateOnly? PaymentDate = null
) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateExpenseValidator().Validate(this).ToFailure();
}

internal sealed class CreateExpenseValidator : AbstractValidator<CreateExpenseCommand>
{
    public CreateExpenseValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição não pode ter mais de 500 caracteres");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow)).WithMessage("Data de vencimento inválida");

        When(x => x.PaymentDate.HasValue, () =>
        {
            RuleFor(x => x.PaymentDate!.Value)
                .GreaterThanOrEqualTo(x => x.DueDate).WithMessage("Data de pagamento não pode ser anterior à data de vencimento");
        });
    }
}