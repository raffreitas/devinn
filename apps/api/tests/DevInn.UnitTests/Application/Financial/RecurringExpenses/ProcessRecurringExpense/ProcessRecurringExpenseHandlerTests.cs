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

    [Fact]
    public async Task Handle_ShouldNotIncrementOccurrenceCount_WhenExpenseAlreadyExists()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));

        var existingExpense = new Expense(
            recurringExpense.CategoryId,
            recurringExpense.Description,
            recurringExpense.Amount,
            recurringExpense.PaymentMethod,
            new DateOnly(2026, 3, 10),
            paymentDate: null,
            recurringExpenseId: recurringExpense.Id);

        _recurringExpenseRepository.GetByIdAsync(recurringExpense.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _expenseRepository.GetByRecurringExpenseIdAndDueDateAsync(
                recurringExpense.Id,
                new DateOnly(2026, 3, 10),
                TestContext.Current.CancellationToken)
            .Returns(existingExpense);
        _dateTimeProvider.GetLocalDate().Returns(new DateOnly(2026, 3, 25));

        var result = await _sut.Handle(
            new ProcessRecurringExpenseCommand(recurringExpense.Id),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(0);
        recurringExpense.GeneratedOccurrencesCount.ShouldBe(0);
        await _expenseRepository.DidNotReceive().AddAsync(Arg.Any<Expense>(), Arg.Any<CancellationToken>());
        await _uow.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldGenerateMultipleExpenses_WhenMultipleOccurrencesAreDue()
    {
        var recurringExpense = new RecurringExpense(
            Guid.NewGuid(),
            "Aluguel",
            new Money(1500m),
            PaymentMethod.BankTransfer,
            new DateOnly(2026, 1, 10));

        _recurringExpenseRepository.GetByIdAsync(recurringExpense.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _expenseRepository.GetByRecurringExpenseIdAndDueDateAsync(
                recurringExpense.Id,
                Arg.Any<DateOnly>(),
                TestContext.Current.CancellationToken)
            .ReturnsNull();
        _dateTimeProvider.GetLocalDate().Returns(new DateOnly(2026, 3, 25));

        var result = await _sut.Handle(
            new ProcessRecurringExpenseCommand(recurringExpense.Id),
            TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(3);
        recurringExpense.GeneratedOccurrencesCount.ShouldBe(3);
        await _expenseRepository.Received(3).AddAsync(Arg.Any<Expense>(), Arg.Any<CancellationToken>());
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}