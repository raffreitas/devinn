using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Time;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;

internal sealed class ProcessRecurringExpenseHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseRepository expenseRepository,
    IUnitOfWork uow,
    IDateTimeProvider dateTimeProvider
) : ICommandHandler<ProcessRecurringExpenseCommand, Result<int>>
{
    public async ValueTask<Result<int>> Handle(ProcessRecurringExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var recurringExpense =
            await recurringExpenseRepository.GetByIdAsync(command.RecurringExpenseId, cancellationToken);
        if (recurringExpense == null)
            return Result.Fail(new NotFoundError("Despesa recorrente não encontrada"));

        var today = dateTimeProvider.GetLocalDate();
        var generatedCount = 0;
        var hasChanges = false;

        while (recurringExpense.ShouldGenerate(today))
        {
            var dueDate = recurringExpense.GetNextDueDate();
            var existingExpense = await expenseRepository.GetByRecurringExpenseIdAndDueDateAsync(
                recurringExpense.Id,
                dueDate,
                cancellationToken);

            if (existingExpense == null)
            {
                var expense = new Expense(
                    recurringExpense.CategoryId,
                    recurringExpense.Description,
                    recurringExpense.Amount,
                    recurringExpense.PaymentMethod,
                    dueDate,
                    paymentDate: null,
                    recurringExpenseId: recurringExpense.Id);

                await expenseRepository.AddAsync(expense, cancellationToken);
                recurringExpense.RegisterGeneratedOccurrence(dueDate);
                generatedCount++;
                hasChanges = true;
            }
        }

        if (!hasChanges)
            return Result.Ok(0);

        await recurringExpenseRepository.UpdateAsync(recurringExpense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(generatedCount);
    }
}