using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Aggregates.Integrations.ValueObjects;
using DevInn.Domain.SeedWork;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Integrations;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class ChannelIntegrationTests
{
    [Fact]
    public void Constructor_ShouldCreateActiveIntegration_WhenUrlIsValidHttps()
    {
        var integration = new ChannelIntegration(
            ChannelType.Booking,
            "https://example.com/feed.ics",
            Guid.NewGuid());

        integration.IsActive.ShouldBeTrue();
        integration.SyncStatus.Status.ShouldBe(SyncStatusType.NeverSynced);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenUrlIsNotHttps()
    {
        Should.Throw<DomainException>(() => new ChannelIntegration(
                ChannelType.Airbnb,
                "http://example.com/feed.ics",
                Guid.NewGuid()))
            .Message.ShouldBe("iCal URL must be a valid HTTPS URL");
    }

    [Fact]
    public void MarkSyncFailed_ShouldStoreErrorMessage()
    {
        var integration = new ChannelIntegration(
            ChannelType.Booking,
            "https://example.com/feed.ics",
            Guid.NewGuid());

        integration.MarkSyncFailed("timeout");

        integration.SyncStatus.Status.ShouldBe(SyncStatusType.Failed);
        integration.SyncStatus.ErrorMessage.ShouldBe("timeout");
    }
}
