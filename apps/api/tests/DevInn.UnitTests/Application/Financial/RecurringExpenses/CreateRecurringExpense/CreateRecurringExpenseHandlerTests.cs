using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Time;
using DevInn.Application.Features.Financial.RecurringExpenses.CreateRecurringExpense;
using DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using Mediator;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.CreateRecurringExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateRecurringExpenseHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseCategoryRepository _categoryRepository = Substitute.For<IExpenseCategoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly ISender _sender = Substitute.For<ISender>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();

    private readonly CreateRecurringExpenseHandler _sut;

    public CreateRecurringExpenseHandlerTests()
    {
        _dateTimeProvider.GetLocalDate().Returns(new DateOnly(2026, 3, 25));
        _sender.Send(Arg.Any<ProcessRecurringExpenseCommand>(), Arg.Any<CancellationToken>())
            .Returns(Result.Ok(1));

        _sut = new CreateRecurringExpenseHandler(
            _recurringExpenseRepository,
            _categoryRepository,
            _uow,
            _sender,
            _dateTimeProvider);
    }

    [Fact]
    public async Task Handle_ShouldProcessRecurringExpenseImmediately_WhenStartDateIsDue()
    {
        var category = new ExpenseCategory("Operacional");
        var command = new CreateRecurringExpenseCommand(
            category.Id,
            "Internet",
            199.90m,
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).Returns(category);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _recurringExpenseRepository.Received(1)
            .AddAsync(Arg.Any<RecurringExpense>(), TestContext.Current.CancellationToken);
        await _sender.Received(1)
            .Send(Arg.Any<ProcessRecurringExpenseCommand>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldNotProcessRecurringExpenseImmediately_WhenStartDateIsInTheFuture()
    {
        var category = new ExpenseCategory("Operacional");
        var command = new CreateRecurringExpenseCommand(
            category.Id,
            "Internet",
            199.90m,
            PaymentMethod.Pix,
            new DateOnly(2026, 4, 10));
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).Returns(category);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _sender.DidNotReceive()
            .Send(Arg.Any<ProcessRecurringExpenseCommand>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        var command = new CreateRecurringExpenseCommand(
            Guid.NewGuid(),
            "Internet",
            199.90m,
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
    }
}