using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Financial.Expenses.DeleteExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.Expenses.DeleteExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class DeleteExpenseHandlerTests
{
    private readonly IExpenseRepository _expenseRepository = Substitute.For<IExpenseRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly DeleteExpenseHandler _sut;

    public DeleteExpenseHandlerTests()
    {
        _sut = new DeleteExpenseHandler(_expenseRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenIdIsEmpty()
    {
        var result = await _sut.Handle(new DeleteExpenseCommand(Guid.Empty), TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenExpenseDoesNotExist()
    {
        var command = new DeleteExpenseCommand(Guid.NewGuid());
        _expenseRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Despesa não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldDeleteExpenseAndCommit_WhenExpenseExists()
    {
        var expense = new Expense(
            categoryId: Guid.NewGuid(),
            description: "Internet",
            amount: new Money(100m),
            paymentMethod: PaymentMethod.Pix,
            dueDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            paymentDate: null);
        var command = new DeleteExpenseCommand(expense.Id);
        _expenseRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(expense);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _expenseRepository.Received(1).DeleteAsync(expense, TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}