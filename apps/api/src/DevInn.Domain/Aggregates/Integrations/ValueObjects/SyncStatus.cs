using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Integrations.ValueObjects;

public sealed record SyncStatus(
    SyncStatusType Status,
    DateTimeOffset? LastSyncAt = null,
    DateTimeOffset? NextSyncAt = null,
    string? ErrorMessage = null,
    int ImportedBookingsCount = 0
) : IValueObject
{
    public static SyncStatus NeverSynced() => new(SyncStatusType.NeverSynced);

    public static SyncStatus Syncing() => new(SyncStatusType.Syncing);

    public static SyncStatus Success(int importedCount, DateTimeOffset syncedAt, DateTimeOffset nextSync) =>
        new(SyncStatusType.Success, syncedAt, nextSync, null, importedCount);

    public static SyncStatus Failed(string errorMessage, DateTimeOffset failedAt) =>
        new(SyncStatusType.Failed, failedAt, null, errorMessage, 0);
}