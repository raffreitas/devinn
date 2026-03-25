using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Time;
using DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.ProcessRecurringExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ProcessRecurringExpenseHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseRepository _expenseRepository = Substitute.For<IExpenseRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();

    private readonly ProcessRecurringExpenseHandler _sut;

    public ProcessRecurringExpenseHandlerTests()
    {
        _sut = new ProcessRecurringExpenseHandler(
            _recurringExpenseRepository,
            _expenseRepository,
            _uow,
            _dateTimeProvider);
    }

    [Fact]
    public async Task Handle_ShouldGenerateExpense_WhenRecurringExpenseIsDue()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));

        _recurringExpenseRepository.GetByIdAsync(recurringExpense.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _expenseRepository.GetByRecurringExpenseIdAndDueDateAsync(
                recurringExpense.Id,
                new DateOnly(2026, 3, 10),
                TestContext.Current.CancellationToken)
            .ReturnsNull();
        _dateTimeProvider.GetLocalDate().Returns(new DateOnly(2026, 3, 25));

        var result = await _sut.Handle(
            new ProcessRecurringExpenseCommand(recurringExpense.Id),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(1);
        await _expenseRepository.Received(1).AddAsync(Arg.Is<Expense>(expense =>
                expense.RecurringExpenseId == recurringExpense.Id && expense.DueDate == new DateOnly(2026, 3, 10)),
            TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldNotGenerateExpense_WhenRecurringExpenseDoesNotExist()
    {
        _recurringExpenseRepository.GetByIdAsync(Arg.Any<Guid>(), TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(
            new ProcessRecurringExpenseCommand(Guid.NewGuid()),
            TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
    }
}