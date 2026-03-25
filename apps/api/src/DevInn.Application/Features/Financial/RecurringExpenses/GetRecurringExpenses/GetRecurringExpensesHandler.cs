using DevInn.Application.Common.Pagination;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Financial.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;

internal sealed class GetRecurringExpensesHandler(
    IRecurringExpenseRepository recurringExpenseRepository,
    IExpenseCategoryRepository categoryRepository)
    : IQueryHandler<GetRecurringExpensesQuery, Result<PaginatedResult<RecurringExpenseResponse>>>
{
    public async ValueTask<Result<PaginatedResult<RecurringExpenseResponse>>> Handle(
        GetRecurringExpensesQuery query,
        CancellationToken cancellationToken)
    {
        var recurringExpenses = await recurringExpenseRepository.GetPagedAsync(
            query.PageNumber,
            query.PageSize,
            query.Status,
            cancellationToken);
        var totalCount = await recurringExpenseRepository.CountAsync(query.Status, cancellationToken);
        var categories = await categoryRepository.GetAllAsync(cancellationToken);
        var categoriesById = categories.ToDictionary(category => category.Id, category => category.Name);

        var items = recurringExpenses
            .Select(recurringExpense => MapResponse(recurringExpense, categoriesById))
            .ToArray();

        return Result.Ok(new PaginatedResult<RecurringExpenseResponse>(items, totalCount, query.PageNumber, query.PageSize));
    }

    private static RecurringExpenseResponse MapResponse(
        RecurringExpense recurringExpense,
        IReadOnlyDictionary<Guid, string> categoriesById)
    {
        categoriesById.TryGetValue(recurringExpense.CategoryId, out var categoryName);

        return new RecurringExpenseResponse(
            recurringExpense.Id,
            recurringExpense.CategoryId,
            categoryName ?? string.Empty,
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
    }
}