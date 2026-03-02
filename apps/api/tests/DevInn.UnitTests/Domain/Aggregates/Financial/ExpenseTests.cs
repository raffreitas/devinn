using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Financial;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ExpenseTests
{
    [Fact]
    public void Constructor_ShouldCreatePendingExpense_WhenPaymentDateIsNull()
    {
        var expense = CreateExpense(paymentDate: null);

        expense.Status.ShouldBe(ExpenseStatus.Pending);
        expense.PaymentDate.ShouldBeNull();
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenAmountIsNotPositive()
    {
        Should.Throw<DomainException>(() => new Expense(
                Guid.NewGuid(),
                "Internet",
                new Money(0m),
                PaymentMethod.Pix,
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                null))
            .Message.ShouldBe("O valor da despesa deve ser maior que zero.");
    }

    [Fact]
    public void MarkAsPaid_ShouldSetStatusAndPaymentDate_WhenPending()
    {
        var expense = CreateExpense();
        var paymentDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        expense.MarkAsPaid(paymentDate);

        expense.Status.ShouldBe(ExpenseStatus.Paid);
        expense.PaymentDate.ShouldBe(paymentDate);
    }

    [Fact]
    public void Update_ShouldThrow_WhenExpenseIsPaid()
    {
        var expense = CreateExpense();
        expense.MarkAsPaid(DateOnly.FromDateTime(DateTime.UtcNow));

        Should.Throw<DomainException>(() => expense.Update(description: "Nova descrição"))
            .Message.ShouldBe("Não é permitido alterar uma despesa Paga ou Cancelada.");
    }

    [Fact]
    public void Cancel_ShouldThrow_WhenExpenseIsPaid()
    {
        var expense = CreateExpense();
        expense.MarkAsPaid(DateOnly.FromDateTime(DateTime.UtcNow));

        Should.Throw<DomainException>(() => expense.Cancel())
            .Message.ShouldBe("Não é possível cancelar uma despesa já paga.");
    }

    private static Expense CreateExpense(DateOnly? paymentDate = null)
    {
        return new Expense(
            categoryId: Guid.NewGuid(),
            description: "Conta de água",
            amount: new Money(100m),
            paymentMethod: PaymentMethod.Pix,
            dueDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            paymentDate: paymentDate);
    }
}
