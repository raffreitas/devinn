using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Inventory;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class RoomTests
{
    [Fact]
    public void Constructor_ShouldCreateRoom_WithDefaultActiveStatusAndToken()
    {
        var room = new Room(Guid.NewGuid(), 101, "Suite");

        room.Status.ShouldBe(RoomStatus.Active);
        room.ICalExportToken.Value.ShouldNotBeNullOrWhiteSpace();
    }

    [Fact]
    public void RegenerateICalExportToken_ShouldThrow_WhenTenantIdIsNotSet()
    {
        var room = new Room(Guid.NewGuid(), 102);

        Should.Throw<DomainException>(() => room.RegenerateICalExportToken())
            .Message.ShouldBe("Não é possível regenerar token sem InnId definido.");
    }

    [Fact]
    public void RegenerateICalExportToken_ShouldGenerateNewToken_WhenTenantIdIsSet()
    {
        var room = new Room(Guid.NewGuid(), 103);
        var previous = room.ICalExportToken.Value;
        room.SetTenantId(Guid.NewGuid());

        room.RegenerateICalExportToken();

        room.ICalExportToken.Value.ShouldNotBe(previous);
    }
}
