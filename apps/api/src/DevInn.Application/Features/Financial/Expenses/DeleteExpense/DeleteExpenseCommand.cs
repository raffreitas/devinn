using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.DeleteExpense;

public sealed record DeleteExpenseCommand(Guid Id) : ICommand<Result>
{
    public Validation Validate() => new DeleteExpenseValidator().Validate(this).ToFailure();
}

public sealed class DeleteExpenseValidator : AbstractValidator<DeleteExpenseCommand>
{
    public DeleteExpenseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID da despesa é obrigatório");
    }
}