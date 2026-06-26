namespace DevInn.Application.Features.Inventory.Queries.Rooms.GetRooms;

public sealed record RoomResponse(
    Guid Id,
    int Number,
    string? Name,
    string Status,
    Guid CategoryId,
    string CategoryName,
    int Capacity,
    decimal BasePrice,
    decimal ExtraGuestPrice,
    long ActiveIntegrationsCount,
    string ICalExportToken,
    RoomIntegrationSummaryResponse[] Integrations
);

public sealed record RoomIntegrationSummaryResponse(
    Guid Id,
    string ChannelType,
    bool IsActive,
    RoomIntegrationSyncStatusResponse SyncStatus);

public sealed record RoomIntegrationSyncStatusResponse(
    string Status,
    DateTimeOffset? LastSyncAt,
    DateTimeOffset? NextSyncAt,
    string? ErrorMessage,
    int ImportedCount);
