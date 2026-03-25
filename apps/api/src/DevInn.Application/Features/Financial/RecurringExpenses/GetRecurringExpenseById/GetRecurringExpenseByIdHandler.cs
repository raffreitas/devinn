using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Financial.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenseById;

internal sealed class GetRecurringExpenseByIdHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseCategoryRepository categoryRepository)
    : IQueryHandler<GetRecurringExpenseByIdQuery, Result<RecurringExpenseResponse>>
{
    public async ValueTask<Result<RecurringExpenseResponse>> Handle(
        GetRecurringExpenseByIdQuery query,
        CancellationToken cancellationToken)
    {
        var recurringExpense = await recurringExpenseRepository.GetByIdAsync(query.Id, cancellationToken);
        if (recurringExpense is null)
            return Result.Fail(new NotFoundError("Despesa recorrente não encontrada"));

        var category = await categoryRepository.GetByIdAsync(recurringExpense.CategoryId, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria de despesa não encontrada"));

        var response = new RecurringExpenseResponse(
            recurringExpense.Id,
            recurringExpense.CategoryId,
            category.Name,
            recurringExpense.Description,
            recurringExpense.Amount,
            recurringExpense.PaymentMethod,
            recurringExpense.StartDate,
            recurringExpense.DayOfMonth,
            recurringExpense.EndDate,
            recurringExpense.MaxOccurrences,
            recurringExpense.LastGeneratedDueDate,
            recurringExpense.GeneratedOccurrencesCount,
            recurringExpense.Status,
            recurringExpense.Status == RecurringExpenseStatus.Active ? recurringExpense.GetNextDueDate() : null
        );

        return Result.Ok(response);
    }
}