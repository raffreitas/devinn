using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Financial;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class RecurringExpenseTests
{
    [Fact]
    public void GetNextDueDate_ShouldClampToLastDayOfMonth_WhenConfiguredDayDoesNotExist()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 1, 31));

        recurringExpense.RegisterGeneratedOccurrence(new DateOnly(2026, 1, 31));

        recurringExpense.GetNextDueDate().ShouldBe(new DateOnly(2026, 2, 28));
    }

    [Fact]
    public void RegisterGeneratedOccurrence_ShouldCompleteRecurringExpense_WhenMaxOccurrencesIsReached()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 1, 10),
            maxOccurrences: 1);

        recurringExpense.RegisterGeneratedOccurrence(new DateOnly(2026, 1, 10));

        recurringExpense.Status.ShouldBe(RecurringExpenseStatus.Completed);
        recurringExpense.GeneratedOccurrencesCount.ShouldBe(1);
    }
}