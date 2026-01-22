using DevInn.Application.Common.Validation;
using FluentResults;
using FluentValidation;
using Mediator;

namespace DevInn.Application.Features.Financial.ExpenseCategories.CreateExpenseCategory;

public sealed record CreateExpenseCategoryCommand(
    string Name) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateExpenseCategoryValidator().Validate(this).ToFailure();
};

public sealed class CreateExpenseCategoryValidator : AbstractValidator<CreateExpenseCategoryCommand>
{
    public CreateExpenseCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome da categoria é obrigatório")
            .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");
    }
}