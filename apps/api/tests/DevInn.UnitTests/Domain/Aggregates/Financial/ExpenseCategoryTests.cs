using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Financial;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ExpenseCategoryTests
{
    [Fact]
    public void Constructor_ShouldCreateCategory_WhenNameIsValid()
    {
        var category = new ExpenseCategory("Operacional");

        category.Name.ShouldBe("Operacional");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        Should.Throw<DomainException>(() => new ExpenseCategory(" "))
            .Message.ShouldBe("O nome da categoria de despesa não pode ser vazio.");
    }
}
