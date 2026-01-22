using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.UpdateExpense;

internal sealed class UpdateExpenseHandler(
    IExpenseRepository expenseRepository,
    IExpenseCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateExpenseCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var expense = await expenseRepository.GetByIdAsync(command.Id, cancellationToken);
        if (expense == null)
            return Result.Fail(new NotFoundError("Despesa não encontrada"));

        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria de despesa não encontrada"));

        expense.Update(command.CategoryId, new Money(command.Amount), command.DueDate, command.Description);

        await expenseRepository.UpdateAsync(expense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
