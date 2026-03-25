using DevInn.Application.Common.Pagination;
using DevInn.Domain.Aggregates.Financial.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;

public sealed record GetRecurringExpensesQuery(
    RecurringExpenseStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 20
) : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<RecurringExpenseResponse>>>;