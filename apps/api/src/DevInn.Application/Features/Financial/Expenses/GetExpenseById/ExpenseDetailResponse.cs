using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenseById;

public sealed record ExpenseDetailResponse(
    Guid Id,
    Guid CategoryId,
    string Description,
    decimal Amount,
    DateOnly DueDate,
    DateOnly? PaymentDate,
    PaymentMethod PaymentMethod,
    string Status,
    Guid? RecurringExpenseId
);