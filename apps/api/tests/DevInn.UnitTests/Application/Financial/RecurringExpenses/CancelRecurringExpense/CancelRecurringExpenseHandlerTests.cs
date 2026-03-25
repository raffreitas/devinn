using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Time;
using DevInn.Application.Features.Financial.RecurringExpenses.CancelRecurringExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.CancelRecurringExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CancelRecurringExpenseHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseRepository _expenseRepository = Substitute.For<IExpenseRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();

    private readonly CancelRecurringExpenseHandler _sut;

    public CancelRecurringExpenseHandlerTests()
    {
        _sut = new CancelRecurringExpenseHandler(
            _recurringExpenseRepository,
            _expenseRepository,
            _uow,
            _dateTimeProvider);
    }

    [Fact]
    public async Task Handle_ShouldCancelRecurringExpense_AndOnlyFuturePendingExpenses()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));
        var futurePendingExpense = new Expense(
            recurringExpense.CategoryId,
            "Internet abril",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 4, 10),
            null,
            recurringExpense.Id);
        var dueTodayExpense = new Expense(
            recurringExpense.CategoryId,
            "Internet hoje",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 25),
            null,
            recurringExpense.Id);

        _dateTimeProvider.GetLocalDate().Returns(new DateOnly(2026, 3, 25));
        _recurringExpenseRepository.GetByIdAsync(recurringExpense.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _expenseRepository.GetPendingByRecurringExpenseIdWithDueDateAfterAsync(
                recurringExpense.Id,
                new DateOnly(2026, 3, 25),
                TestContext.Current.CancellationToken)
            .Returns([futurePendingExpense]);

        var result = await _sut.Handle(
            new CancelRecurringExpenseCommand(recurringExpense.Id),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        recurringExpense.Status.ShouldBe(RecurringExpenseStatus.Cancelled);
        futurePendingExpense.Status.ShouldBe(ExpenseStatus.Cancelled);
        dueTodayExpense.Status.ShouldBe(ExpenseStatus.Pending);
        await _expenseRepository.Received(1).UpdateAsync(futurePendingExpense, TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenRecurringExpenseDoesNotExist()
    {
        _recurringExpenseRepository.GetByIdAsync(Arg.Any<Guid>(), TestContext.Current.CancellationToken)
            .ReturnsNull();

        var result = await _sut.Handle(
            new CancelRecurringExpenseCommand(Guid.NewGuid()),
            TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
    }
}