using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class RoomCategoryTests
{
    [Fact]
    public void Constructor_ShouldCreateRoomCategory_WhenValidParameters()
    {
        // Arrange
        const string name = "Standard Room";
        const string description = "A comfortable room with basic amenities.";
        const int maxCapacity = 2;
        var pricingPolicy = new PricingPolicy(basePrice: 100m, personPrice: 20m);

        // Act
        var roomCategory = new RoomCategory(name, description, maxCapacity, pricingPolicy);

        // Assert
        roomCategory.Name.ShouldBe(name);
        roomCategory.Description.ShouldBe(description);
        roomCategory.MaxCapacity.ShouldBe(maxCapacity);
        roomCategory.PricingPolicy.ShouldBe(pricingPolicy);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        // Arrange
        const string name = "";
        const string description = "A comfortable room with basic amenities.";
        const int maxCapacity = 2;
        var pricingPolicy = new PricingPolicy(basePrice: 1m, personPrice: 1m);

        // Act & Assert
        Should.Throw<DomainException>(() => new RoomCategory(name, description, maxCapacity, pricingPolicy))
            .Message.ShouldBe("O campo 'name' não pode ser nulo ou vazio.");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenDescriptionIsEmpty()
    {
        // Arrange
        const string name = "Standard Room";
        const string description = "";
        const int maxCapacity = 2;

        // Act & Assert
        Should.Throw<DomainException>(() => new RoomCategory(name, description, maxCapacity, null!))
            .Message.ShouldBe("O campo 'description' não pode ser nulo ou vazio.");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenMaxCapacityIsZero()
    {
        // Arrange
        const string name = "Standard Room";
        const string description = "A comfortable room with basic amenities.";
        const int maxCapacity = 0;

        // Act & Assert
        Should.Throw<DomainException>(() => new RoomCategory(name, description, maxCapacity, new PricingPolicy(1, 2)))
            .Message.ShouldBe("A capacidade máxima deve ser maior que zero.");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenPricingPolicyIsNull()
    {
        // Arrange
        const string name = "Standard Room";
        const string description = "A comfortable room with basic amenities.";
        const int maxCapacity = 2;
        PricingPolicy pricingPolicy = null!;

        // Act & Assert
        Should.Throw<DomainException>(() => new RoomCategory(name, description, maxCapacity, pricingPolicy!))
            .Message.ShouldBe("O campo 'pricingPolicy' não pode ser nulo.");
    }
}