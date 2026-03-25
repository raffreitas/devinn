using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenses;

internal sealed record RawExpense(
    Guid Id,
    Guid CategoryId,
    string Description,
    decimal Amount,
    DateOnly DueDate,
    DateOnly? PaymentDate,
    PaymentMethod PaymentMethod,
    string Status,
    string CategoryName,
    Guid? RecurringExpenseId,
    string? RecurringExpenseDescription
);

public sealed record ExpenseResponse(
    Guid Id,
    Guid CategoryId,
    string Description,
    decimal Amount,
    DateOnly DueDate,
    DateOnly? PaymentDate,
    PaymentMethod PaymentMethod,
    ExpenseDisplayStatus Status,
    string CategoryName,
    Guid? RecurringExpenseId,
    string? RecurringExpenseDescription
);

public enum ExpenseDisplayStatus
{
    Pending,
    Paid,
    Cancelled,
    Overdue,
    DueToday
}