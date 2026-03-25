using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;

public sealed record RecurringExpenseResponse(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string Description,
    decimal Amount,
    PaymentMethod PaymentMethod,
    DateOnly StartDate,
    int DayOfMonth,
    DateOnly? EndDate,
    int? MaxOccurrences,
    DateOnly? LastGeneratedDueDate,
    int GeneratedOccurrencesCount,
    RecurringExpenseStatus Status,
    DateOnly? NextDueDate
);