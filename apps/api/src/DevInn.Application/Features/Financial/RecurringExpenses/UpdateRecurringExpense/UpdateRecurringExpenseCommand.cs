using DevInn.Application.Common.Validation;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.UpdateRecurringExpense;

public sealed record UpdateRecurringExpenseCommand(
    Guid Id,
    Guid CategoryId,
    string Description,
    decimal Amount,
    PaymentMethod PaymentMethod,
    DateOnly StartDate,
    DateOnly? EndDate = null,
    int? MaxOccurrences = null
) : ICommand<Result>
{
    public Validation Validate() => new UpdateRecurringExpenseValidator().Validate(this).ToFailure();
}

public sealed class UpdateRecurringExpenseValidator : AbstractValidator<UpdateRecurringExpenseCommand>
{
    public UpdateRecurringExpenseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID da despesa recorrente é obrigatório");
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição não pode ter mais de 500 caracteres");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.StartDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1)))
            .WithMessage("Data inicial inválida");

        When(x => x.EndDate.HasValue, () =>
        {
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("Data final não pode ser anterior à data inicial");
        });

        When(x => x.MaxOccurrences.HasValue, () =>
        {
            RuleFor(x => x.MaxOccurrences!.Value)
                .GreaterThan(0)
                .WithMessage("Quantidade máxima de ocorrências deve ser maior que zero");
        });
    }
}