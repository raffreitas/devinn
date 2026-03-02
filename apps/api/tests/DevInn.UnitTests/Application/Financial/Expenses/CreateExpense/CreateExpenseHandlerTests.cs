using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Financial.Expenses.CreateExpense;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Shared.Enums;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Financial.Expenses.CreateExpense;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateExpenseHandlerTests
{
    private readonly IExpenseRepository _expenseRepository = Substitute.For<IExpenseRepository>();
    private readonly IExpenseCategoryRepository _categoryRepository = Substitute.For<IExpenseCategoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateExpenseHandler _sut;

    public CreateExpenseHandlerTests()
    {
        _sut = new CreateExpenseHandler(_expenseRepository, _categoryRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        var command = CreateValidCommand(Guid.NewGuid());
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Categoria de despesa não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldCreateExpenseAndCommit_WhenCommandIsValid()
    {
        var category = new ExpenseCategory("Operacional");
        var command = CreateValidCommand(category.Id);
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).Returns(category);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _expenseRepository.Received(1).AddAsync(Arg.Any<Expense>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    private static CreateExpenseCommand CreateValidCommand(Guid categoryId)
    {
        return new CreateExpenseCommand(
            CategoryId: categoryId,
            Description: "Conta de energia",
            Amount: 250m,
            PaymentMethod: PaymentMethod.Pix,
            DueDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)));
    }
}
