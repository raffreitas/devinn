using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Features.Financial.RecurringExpenses.UpdateRecurringExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.RecurringExpenses.UpdateRecurringExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateRecurringExpenseHandlerTests
{
    private readonly IRecurringExpenseRepository _recurringExpenseRepository = Substitute.For<IRecurringExpenseRepository>();
    private readonly IExpenseCategoryRepository _categoryRepository = Substitute.For<IExpenseCategoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly UpdateRecurringExpenseHandler _sut;

    public UpdateRecurringExpenseHandlerTests()
    {
        _sut = new UpdateRecurringExpenseHandler(_recurringExpenseRepository, _categoryRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldUpdateRecurringExpense_WhenCommandIsValid()
    {
        var oldCategory = new ExpenseCategory("Operacional");
        var newCategory = new ExpenseCategory("Serviços");
        var recurringExpense = new RecurringExpense(
            oldCategory.Id,
            "Internet",
            new Money(199.90m),
            PaymentMethod.Pix,
            new DateOnly(2026, 3, 10));
        var command = new UpdateRecurringExpenseCommand(
            recurringExpense.Id,
            newCategory.Id,
            "Internet fibra",
            249.90m,
            PaymentMethod.CreditCard,
            new DateOnly(2026, 3, 15),
            new DateOnly(2026, 12, 15),
            10);

        _recurringExpenseRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken)
            .Returns(recurringExpense);
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken)
            .Returns(newCategory);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        recurringExpense.Description.ShouldBe("Internet fibra");
        recurringExpense.Amount.ShouldBe(new Money(249.90m));
        recurringExpense.PaymentMethod.ShouldBe(PaymentMethod.CreditCard);
        recurringExpense.StartDate.ShouldBe(new DateOnly(2026, 3, 15));
        recurringExpense.DayOfMonth.ShouldBe(15);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenRecurringExpenseDoesNotExist()
    {
        var command = new UpdateRecurringExpenseCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Internet fibra",
            249.90m,
            PaymentMethod.CreditCard,
            new DateOnly(2026, 3, 15));

        _recurringExpenseRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken)
            .ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
    }
}