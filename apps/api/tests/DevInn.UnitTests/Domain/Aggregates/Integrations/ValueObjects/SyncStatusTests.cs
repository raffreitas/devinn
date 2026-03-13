using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Aggregates.Integrations.ValueObjects;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Integrations.ValueObjects;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class SyncStatusTests
{
    [Fact]
    public void Success_ShouldCreateStatusWithImportedCountAndNextSync()
    {
        var nextSync = DateTimeOffset.UtcNow.AddHours(2);

        var status = SyncStatus.Success(3, DateTimeOffset.UtcNow, nextSync);

        status.Status.ShouldBe(SyncStatusType.Success);
        status.ImportedBookingsCount.ShouldBe(3);
        status.NextSyncAt.ShouldBe(nextSync);
    }
}