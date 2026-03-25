using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Time;
using DevInn.Application.Common.Validation;
using DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.CreateRecurringExpense;

internal sealed class CreateRecurringExpenseHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseCategoryRepository categoryRepository,
    IUnitOfWork uow,
    ISender sender,
    IDateTimeProvider dateTimeProvider
) : ICommandHandler<CreateRecurringExpenseCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateRecurringExpenseCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var category = await categoryRepository.GetByIdAsync(command.CategoryId, cancellationToken);
        if (category == null)
            return Result.Fail(new NotFoundError("Categoria de despesa não encontrada"));

        var recurringExpense = new RecurringExpense(
            command.CategoryId,
            command.Description,
            new Money(command.Amount),
            command.PaymentMethod,
            command.StartDate,
            command.EndDate,
            command.MaxOccurrences);

        await recurringExpenseRepository.AddAsync(recurringExpense, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        if (recurringExpense.ShouldGenerate(dateTimeProvider.GetLocalDate()))
        {
            var result = await sender.Send(new ProcessRecurringExpenseCommand(recurringExpense.Id), cancellationToken);
            if (result.IsFailed)
                return Result.Fail(result.Errors);
        }

        return Result.Ok(recurringExpense.Id);
    }
}