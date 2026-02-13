using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.SeedWork;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class EntityTests
{
    [Fact]
    public void Constructor_ShouldInitializeProperties()
    {
        // Act
        var entity = new TestEntity();

        // Assert
        entity.Id.ShouldNotBe(Guid.Empty);
        entity.CreatedAt.ShouldBeLessThanOrEqualTo(DateTimeOffset.UtcNow);
        entity.UpdatedAt.ShouldBeLessThanOrEqualTo(DateTimeOffset.UtcNow);
    }

    [Fact]
    public void SetTenant_ShouldSetTenantId_WhenTenantIdIsValid()
    {
        // Arrange
        var entity = new TestEntity();
        var tenantId = Guid.NewGuid();

        // Act
        entity.SetTenantId(tenantId);

        // Assert
        tenantId.ShouldBe(entity.InnId);
    }
}

internal sealed class TestEntity : Entity
{
}