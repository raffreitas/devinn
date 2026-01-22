using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenses;

public sealed record GetExpensesQuery : IQuery<Result<ExpenseResponse[]>>;