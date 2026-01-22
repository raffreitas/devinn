using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenseById;

public sealed record GetExpenseByIdQuery(Guid Id) : IQuery<Result<ExpenseDetailResponse>>;