using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Aggregates.Integrations.ValueObjects;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Integrations;

public sealed class ChannelIntegration : Entity
{
    public ChannelType ChannelType { get; private set; }
    public string ICalUrl { get; private set; } = null!;
    public Guid RoomId { get; private set; }
    public bool IsActive { get; private set; }
    public SyncStatus SyncStatus { get; private set; }

    private ChannelIntegration()
    {
        SyncStatus = SyncStatus.NeverSynced();
    }

    public ChannelIntegration(
        ChannelType channelType,
        string iCalUrl,
        Guid roomId)
    {
        if (string.IsNullOrWhiteSpace(iCalUrl))
            throw new DomainException("iCal URL cannot be empty");

        if (!Uri.TryCreate(iCalUrl, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
            throw new DomainException("iCal URL must be a valid HTTPS URL");

        ChannelType = channelType;
        ICalUrl = iCalUrl;
        RoomId = roomId;
        IsActive = true;
        SyncStatus = SyncStatus.NeverSynced();
    }

    public void UpdateICalUrl(string newUrl)
    {
        if (string.IsNullOrWhiteSpace(newUrl))
            throw new DomainException("iCal URL cannot be empty");

        if (!Uri.TryCreate(newUrl, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
            throw new DomainException("iCal URL must be a valid HTTPS URL");

        ICalUrl = newUrl;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateRoomId(Guid roomId)
    {
        RoomId = roomId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void MarkSyncStarted()
    {
        SyncStatus = SyncStatus.Syncing();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void MarkSyncSuccess(int importedCount, DateTimeOffset nextSyncAt)
    {
        SyncStatus = SyncStatus.Success(importedCount, DateTimeOffset.UtcNow, nextSyncAt);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void MarkSyncFailed(string errorMessage)
    {
        SyncStatus = SyncStatus.Failed(errorMessage, DateTimeOffset.UtcNow);
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}