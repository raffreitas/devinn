using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.CancelRecurringExpense;

public sealed record CancelRecurringExpenseCommand(Guid Id) : ICommand<Result>
{
    public Validation Validate() => new CancelRecurringExpenseValidator().Validate(this).ToFailure();
}

public sealed class CancelRecurringExpenseValidator : AbstractValidator<CancelRecurringExpenseCommand>
{
    public CancelRecurringExpenseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID da despesa recorrente é obrigatório");
    }
}