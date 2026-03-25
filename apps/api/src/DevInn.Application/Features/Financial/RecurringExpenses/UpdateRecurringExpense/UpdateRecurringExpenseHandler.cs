using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.UpdateRecurringExpense;

internal sealed class UpdateRecurringExpenseHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateRecurringExpenseCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateRecurringExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var recurringExpense = await recurringExpenseRepository.GetByIdAsync(command.Id, cancellationToken);
        if (recurringExpense is null)
            return Result.Fail(new NotFoundError("Despesa recorrente não encontrada"));

        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria de despesa não encontrada"));

        recurringExpense.Update(
            command.CategoryId,
            command.Description,
            new Money(command.Amount),
            command.PaymentMethod,
            command.StartDate,
            command.EndDate,
            command.MaxOccurrences);

        await recurringExpenseRepository.UpdateAsync(recurringExpense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}