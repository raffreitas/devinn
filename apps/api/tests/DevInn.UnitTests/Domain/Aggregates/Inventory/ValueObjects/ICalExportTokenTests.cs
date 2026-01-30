using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ICalExportTokenTests
{
    [Fact]
    public void ExtractInnId_ShouldReturnInnId_WhenTokenWasGenerated()
    {
        // Arrange
        var innId = Guid.CreateVersion7();
        var token = ICalExportToken.Generate(innId);

        // Act
        var extracted = token.ExtractInnId();

        // Assert
        extracted.ShouldBe(innId);
    }

    [Fact]
    public void ExtractInnId_ShouldThrow_WhenTokenTooShort()
    {
        // Act & Assert
        var invalidToken = new string('!', 32);
        Should.Throw<DomainException>(() => ICalExportToken.FromString(invalidToken).ExtractInnId())
            .Message.ShouldBe("Token de exportação iCal inválido.");
    }
}