namespace DevInn.Application.Features.Financial.ExpenseCategories.GetExpenseCategories;

public sealed record ExpenseCategoryResponse(
    Guid Id,
    string Name);