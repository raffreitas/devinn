using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.SeedWork;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class DomainExceptionTests
{
    [Theory]
    [InlineData(null, "O objeto não pode ser nulo.")]
    [InlineData("obj", "O campo 'obj' não pode ser nulo.")]
    public void ThrowIfNull_ShouldThrowDomainException_WhenObjectIsNull(string? propertyName, string expectedMessage)
    {
        // Arrange
        object? obj = null;

        // Act & Assert
        Should.Throw<DomainException>(() => DomainException.ThrowIfNull(obj, propertyName))
            .Message.ShouldBe(expectedMessage);
    }

    [Theory]
    [InlineData(null, "", "O objeto não pode ser nulo ou vazio.")]
    [InlineData("", "a", "O campo 'a' não pode ser nulo ou vazio.")]
    [InlineData("   ", "b", "O campo 'b' não pode ser nulo ou vazio.")]
    public void ThrowIfNullOrWhiteSpace_ShouldThrowDomainException_WhenStringIsNullOrWhiteSpace(
        string? value,
        string? propertyName,
        string expectedMessage)
    {
        // Act & Assert
        Should.Throw<DomainException>(() => DomainException.ThrowIfNullOrWhiteSpace(value, propertyName))
            .Message.ShouldBe(expectedMessage);
    }
}