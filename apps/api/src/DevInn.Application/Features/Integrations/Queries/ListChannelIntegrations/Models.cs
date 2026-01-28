using DevInn.Domain.Aggregates.Integrations.Enums;

namespace DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;

public record ChannelIntegrationDto(
    Guid Id,
    ChannelType ChannelType,
    string ICalUrl,
    Guid RoomId,
    string RoomName,
    bool IsActive,
    SyncStatusDto SyncStatus,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record SyncStatusDto(
    string Status,
    DateTimeOffset? LastSyncAt,
    DateTimeOffset? NextSyncAt,
    string? ErrorMessage,
    int ImportedCount
);