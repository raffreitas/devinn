using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.GetRecurringExpenses;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class GetRecurringExpensesHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseCategoryRepository _categoryRepository = Substitute.For<IExpenseCategoryRepository>();

    private readonly GetRecurringExpensesHandler _sut;

    public GetRecurringExpensesHandlerTests()
    {
        _sut = new GetRecurringExpensesHandler(_recurringExpenseRepository, _categoryRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnPagedRecurringExpenses()
    {
        var category = new ExpenseCategory("Operacional");
        var recurringExpense = new RecurringExpense(
            category.Id,
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));

        _recurringExpenseRepository.GetPagedAsync(1, 20, RecurringExpenseStatus.Active, TestContext.Current.CancellationToken)
            .Returns([recurringExpense]);
        _recurringExpenseRepository.CountAsync(RecurringExpenseStatus.Active, TestContext.Current.CancellationToken)
            .Returns(1);
        _categoryRepository.GetAllAsync(TestContext.Current.CancellationToken)
            .Returns([category]);

        var result = await _sut.Handle(
            new GetRecurringExpensesQuery(RecurringExpenseStatus.Active),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.TotalCount.ShouldBe(1);
        result.Value.Items.ShouldHaveSingleItem();
        result.Value.Items[0].CategoryName.ShouldBe("Operacional");
        result.Value.Items[0].NextDueDate.ShouldBe(new DateOnly(2026, 3, 10));
    }
}