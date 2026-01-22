using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.CreateExpense;

internal sealed class CreateExpenseHandler(
    IExpenseRepository expenseRepository,
    IExpenseCategoryRepository categoryRepository,
    IUnitOfWork uow
) : ICommandHandler<CreateExpenseCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria de despesa não encontrada"));

        var expense = new Expense(
            command.CategoryId,
            command.Description,
            new Money(command.Amount),
            command.PaymentMethod,
            command.DueDate,
            command.PaymentDate
        );

        await expenseRepository.AddAsync(expense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(expense.Id);
    }
}