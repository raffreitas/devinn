using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Time;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.CancelRecurringExpense;

internal sealed class CancelRecurringExpenseHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseRepository expenseRepository,
    IUnitOfWork uow,
    IDateTimeProvider dateTimeProvider) : ICommandHandler<CancelRecurringExpenseCommand, Result>
{
    public async ValueTask<Result> Handle(CancelRecurringExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var recurringExpense = await recurringExpenseRepository.GetByIdAsync(command.Id, cancellationToken);
        if (recurringExpense is null)
            return Result.Fail(new NotFoundError("Despesa recorrente não encontrada"));

        var cancellationDate = dateTimeProvider.GetLocalDate();
        var pendingExpenses = await expenseRepository.GetPendingByRecurringExpenseIdWithDueDateAfterAsync(
            recurringExpense.Id,
            cancellationDate,
            cancellationToken);

        recurringExpense.Cancel();

        foreach (var expense in pendingExpenses)
        {
            expense.Cancel();
            await expenseRepository.UpdateAsync(expense, cancellationToken);
        }

        await recurringExpenseRepository.UpdateAsync(recurringExpense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}