using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.DeleteExpense;

internal sealed class DeleteExpenseHandler(
    IExpenseRepository expenseRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteExpenseCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var expense = await expenseRepository.GetByIdAsync(command.Id, cancellationToken);
        if (expense == null)
            return Result.Fail(new NotFoundError("Despesa não encontrada"));

        await expenseRepository.DeleteAsync(expense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}