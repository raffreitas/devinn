using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ICalExportTokenTests
{
    [Fact]
    public void Generate_ShouldReturnTokenWithMinimumLength()
    {
        // Arrange
        var token = ICalExportToken.Generate();

        // Assert
        token.Value.Length.ShouldBeGreaterThanOrEqualTo(32);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenTokenTooShort()
    {
        // Act & Assert
        Should.Throw<DomainException>(() => ICalExportToken.FromString("short"))
            .Message.ShouldBe("Token de exportação iCal deve ter pelo menos 32 caracteres.");
    }
}
