using DevInn.Application.Common.Pagination;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenses;

public sealed record GetExpensesQuery(
    Guid? CategoryId = null,
    PaymentMethod? PaymentMethod = null,
    string? Status = null,
    DateOnly? DueDateFrom = null,
    DateOnly? DueDateTo = null,
    int PageNumber = 1,
    int PageSize = 20
) : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<ExpenseResponse>>>;