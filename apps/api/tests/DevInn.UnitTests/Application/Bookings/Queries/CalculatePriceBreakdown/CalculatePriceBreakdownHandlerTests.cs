using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Services;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Queries.CalculatePriceBreakdown;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CalculatePriceBreakdownHandlerTests
{
    private readonly IRoomCategoryRepository _roomCategoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IPricingCalculatorService _pricingCalculatorService = new PricingCalculatorService();
    private readonly CalculatePriceBreakdownHandler _sut;

    public CalculatePriceBreakdownHandlerTests()
    {
        _sut = new CalculatePriceBreakdownHandler(_roomCategoryRepository, _pricingCalculatorService);
    }

    [Fact]
    public async Task Handle_ShouldReturnsCorrectDto_WhenValidQuery()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var category = new RoomCategory(
            "Suite",
            "Desc",
            2,
            new PricingPolicy(200m, 50m)
        );

        _roomCategoryRepository.GetByIdAsync(roomId).Returns(category);

        var query = new CalculatePriceBreakdownQuery(
            roomId,
            new DateTimeOffset(2026, 1, 24, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 27, 0, 0, 0, TimeSpan.Zero),
            2,
            0,
            []
        );

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.BasePrice.ShouldBe(200m);
        result.Value.Total.ShouldBe(600m);
    }

    [Fact]
    public async Task Handle_ShouldReturnsFailed_WhenRoomNotFound()
    {
        // Arrange
        _roomCategoryRepository.GetByIdAsync(Arg.Any<Guid>())
            .ReturnsNull();

        var query = new CalculatePriceBreakdownQuery(
            Guid.NewGuid(),
            new DateTimeOffset(2026, 1, 24, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 27, 0, 0, 0, TimeSpan.Zero),
            2,
            0,
            []
        );

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.ShouldBeFalse();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
    }
}