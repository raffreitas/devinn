using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.ExpenseCategories.GetExpenseCategories;

public sealed record GetExpenseCategoriesQuery : IQuery<Result<ExpenseCategoryResponse[]>>;