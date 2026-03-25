using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenseById;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.GetRecurringExpenseById;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class GetRecurringExpenseByIdHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseCategoryRepository _categoryRepository = Substitute.For<IExpenseCategoryRepository>();

    private readonly GetRecurringExpenseByIdHandler _sut;

    public GetRecurringExpenseByIdHandlerTests()
    {
        _sut = new GetRecurringExpenseByIdHandler(_recurringExpenseRepository, _categoryRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnRecurringExpense_WhenItExists()
    {
        var category = new ExpenseCategory("Operacional");
        var recurringExpense = new RecurringExpense(
            category.Id,
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));

        _recurringExpenseRepository.GetByIdAsync(recurringExpense.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _categoryRepository.GetByIdAsync(category.Id, TestContext.Current.CancellationToken)
            .Returns(category);

        var result = await _sut.Handle(
            new GetRecurringExpenseByIdQuery(recurringExpense.Id),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.Description.ShouldBe("Internet");
        result.Value.CategoryName.ShouldBe("Operacional");
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenRecurringExpenseDoesNotExist()
    {
        _recurringExpenseRepository.GetByIdAsync(Arg.Any<Guid>(), TestContext.Current.CancellationToken)
            .ReturnsNull();

        var result = await _sut.Handle(
            new GetRecurringExpenseByIdQuery(Guid.NewGuid()),
            TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
    }
}