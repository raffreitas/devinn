using DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;

using FluentValidation.TestHelper;

namespace DevInn.UnitTests.Application.Bookings.Queries.CalculatePriceBreakdown;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CalculatePriceBreakdownValidatorTests
{
    private readonly CalculatePriceBreakdownValidator _validator = new();

    [Fact]
    public void Validate_ShouldReturnFailure_WhenRoomCategoryIdIsEmpty()
    {
        // Arrange
        var query = new CalculatePriceBreakdownQuery(
            Guid.Empty,
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(5),
            2,
            0,
            []);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(q => q.RoomCategoryId);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenCheckInIsNotLessThanCheckOut()
    {
        // Arrange
        var query = new CalculatePriceBreakdownQuery(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(5),
            DateTimeOffset.UtcNow.AddDays(1),
            2,
            0,
            []);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(q => q.CheckIn);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenAdultsIsZero()
    {
        // Arrange
        var query = new CalculatePriceBreakdownQuery(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(5),
            0,
            0,
            []);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(q => q.Adults);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenChildrenIsLessZero()
    {
        // Arrange
        var query = new CalculatePriceBreakdownQuery(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(5),
            1,
            -2,
            []);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(q => q.Children);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenChildrenAgesIsNotEqualToChildrensCount()
    {
        // Arrange
        var query = new CalculatePriceBreakdownQuery(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(5),
            2,
            2,
            [1]);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(q => q.ChildrenAges);
    }
}