using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Enums;

using FluentResults;

using Mediator;

using System.Text.Json;

namespace DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;

internal sealed class ListChannelIntegrationsHandler(
    IDbConnectionFactory dbConnectionFactory,
    ITenantContext tenantContext)
    : IQueryHandler<ListChannelIntegrationsQuery, Result<PaginatedResult<ChannelIntegrationDto>>>
{
    public async ValueTask<Result<PaginatedResult<ChannelIntegrationDto>>> Handle(
        ListChannelIntegrationsQuery query,
        CancellationToken cancellationToken)
    {
        const string countSql = """
                                SELECT count(1)
                                FROM channel_integrations ci
                                WHERE ci.inn_id = @TenantId
                                    AND (@IsActive IS NULL OR ci.is_active = @IsActive)
                                """;

        const string sql = """
                           SELECT ci.id                    AS "Id",
                                  ci.channel_type          AS "ChannelType",
                                  ci.ical_url              AS "ICalUrl",
                                  ci.room_id               AS "RoomId",
                                  r.number                 AS "RoomName",
                                  ci.is_active             AS "IsActive",
                                  ci.sync_status           AS "SyncStatus",
                                  ci.created_at            AS "CreatedAt",
                                  ci.updated_at            AS "UpdatedAt"
                           FROM channel_integrations ci
                           INNER JOIN rooms r ON ci.room_id = r.id
                           WHERE ci.inn_id = @TenantId
                               AND (@IsActive IS NULL OR ci.is_active = @IsActive)
                           ORDER BY ci.created_at DESC
                           OFFSET @Offset ROWS
                           FETCH NEXT @PageSize ROWS ONLY
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);

        var parameters = new
        {
            TenantId = tenantContext.Tenant.Id,
            query.IsActive,
            Offset = (query.PageNumber - 1) * query.PageSize,
            query.PageSize
        };

        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

        var results = await connection.QueryAsync<IntegrationRaw>(sql, parameters);

        var integrations = results.Select(MapToDto).ToList();

        return Result.Ok(new PaginatedResult<ChannelIntegrationDto>(
            integrations.ToArray(),
            totalCount,
            query.PageNumber,
            query.PageSize));
    }

    private static ChannelIntegrationDto MapToDto(IntegrationRaw raw)
    {
        var syncStatusValue = JsonSerializer.Deserialize<SyncStatusJson>(raw.SyncStatus) ?? new SyncStatusJson();
        var channelType = Enum.Parse<ChannelType>(raw.ChannelType, ignoreCase: true);

        return new ChannelIntegrationDto(
            raw.Id,
            channelType,
            raw.ICalUrl,
            raw.RoomId,
            raw.RoomName.ToString(),
            raw.IsActive,
            new SyncStatusDto(
                syncStatusValue.Status ?? "NeverSynced",
                syncStatusValue.LastSyncAt,
                syncStatusValue.NextSyncAt,
                syncStatusValue.ErrorMessage,
                syncStatusValue.ImportedBookingsCount),
            new DateTimeOffset(raw.CreatedAt, TimeSpan.Zero),
            new DateTimeOffset(raw.UpdatedAt, TimeSpan.Zero));
    }

    private sealed record IntegrationRaw(
        Guid Id,
        string ChannelType,
        string ICalUrl,
        Guid RoomId,
        int RoomName,
        bool IsActive,
        string SyncStatus,
        DateTime CreatedAt,
        DateTime UpdatedAt);

    private sealed record SyncStatusJson(
        string? Status = null,
        DateTimeOffset? LastSyncAt = null,
        DateTimeOffset? NextSyncAt = null,
        string? ErrorMessage = null,
        int ImportedBookingsCount = 0);
}