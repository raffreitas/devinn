using System.Text.Json;
using System.Text.Json.Serialization;

using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Queries.Rooms.GetRooms;

internal sealed class GetRoomsHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<GetRoomsQuery, Result<PaginatedResult<RoomResponse>>>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public async ValueTask<Result<PaginatedResult<RoomResponse>>> Handle(GetRoomsQuery query,
        CancellationToken cancellationToken)
    {
        const string countSql = """
                                SELECT count(1)
                                FROM rooms r
                                WHERE r.inn_id = @TenantId
                                    AND (@CategoryId IS NULL OR r.category_id = @CategoryId)
                                    AND (@Status IS NULL OR r.status = @Status);
                                """;

        const string sql = """
                            SELECT r.id                      AS "Id",
                                   r.number                  AS "Number",
                                   r.name                    AS "Name",
                                   r.status                  AS "Status",
                                   r.category_id             AS "CategoryId",
                                   rc.name                   AS "CategoryName",
                                   rc.max_capacity           AS "Capacity",
                                   rc.base_price             AS "BasePrice",
                                   rc.person_price           AS "ExtraGuestPrice",
                                   COALESCE(ci_summary.active_total, 0) AS "ActiveIntegrationsCount",
                                   r.ical_export_token       AS "ICalExportToken",
                                   COALESCE(ci_summary.integrations, '[]'::jsonb)::text AS "IntegrationsJson"
                            FROM rooms r
                            JOIN room_categories rc ON r.category_id = rc.Id
                                AND rc.inn_id = r.inn_id
                            LEFT JOIN (
                                SELECT room_id,
                                       COUNT(*) FILTER (WHERE is_active = true) as active_total,
                                       jsonb_agg(
                                           jsonb_build_object(
                                               'id', id,
                                               'channelType', channel_type,
                                               'isActive', is_active,
                                               'syncStatus', sync_status
                                           )
                                           ORDER BY channel_type
                                       ) as integrations
                                FROM channel_integrations
                                WHERE inn_id = @TenantId
                                GROUP BY room_id
                            ) ci_summary ON ci_summary.room_id = r.id
                            WHERE r.inn_id = @TenantId
                                AND (@CategoryId IS NULL OR r.category_id = @CategoryId)
                                AND (@Status IS NULL OR r.status = @Status)
                            ORDER BY r.Number
                            OFFSET @Offset
                            LIMIT @PageSize;
                            """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var count = await connection.ExecuteScalarAsync<int>(countSql,
            new { TenantId = tenantContext.Tenant.Id, Status = query.Status?.ToString(), query.CategoryId });

        var rooms = await connection.QueryAsync<RoomResponseRaw>(
            sql,
            new
            {
                TenantId = tenantContext.Tenant.Id,
                Status = query.Status?.ToString(),
                query.PageSize,
                query.Offset,
                query.CategoryId
            }
        );

        var paginatedResult = new PaginatedResult<RoomResponse>(
            rooms.Select(MapToResponse).ToArray(),
            count,
            query.PageNumber,
            query.PageSize
        );
        return Result.Ok(paginatedResult);
    }

    private static RoomResponse MapToResponse(RoomResponseRaw raw)
        => new(
            raw.Id,
            raw.Number,
            raw.Name,
            raw.Status,
            raw.CategoryId,
            raw.CategoryName,
            raw.Capacity,
            raw.BasePrice,
            raw.ExtraGuestPrice,
            raw.ActiveIntegrationsCount,
            raw.ICalExportToken,
            ParseIntegrations(raw.IntegrationsJson));

    private static RoomIntegrationSummaryResponse[] ParseIntegrations(string integrationsJson)
    {
        var integrations = JsonSerializer.Deserialize<IntegrationSummaryJson[]>(integrationsJson, JsonOptions) ?? [];

        return integrations
            .Select(integration =>
            {
                var syncStatus = integration.SyncStatus ?? new SyncStatusJson();
                return new RoomIntegrationSummaryResponse(
                    integration.Id,
                    integration.ChannelType,
                    integration.IsActive,
                    new RoomIntegrationSyncStatusResponse(
                        syncStatus.Status ?? "NeverSynced",
                        syncStatus.LastSyncAt,
                        syncStatus.NextSyncAt,
                        syncStatus.ErrorMessage,
                        syncStatus.ImportedBookingsCount));
            })
            .ToArray();
    }

    private sealed record RoomResponseRaw(
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
        string IntegrationsJson);

    private sealed record IntegrationSummaryJson(
        Guid Id,
        string ChannelType,
        bool IsActive,
        SyncStatusJson? SyncStatus);

    private sealed record SyncStatusJson(
        [property: JsonPropertyName("status")] string? Status = null,
        [property: JsonPropertyName("lastSyncAt")]
        DateTimeOffset? LastSyncAt = null,
        [property: JsonPropertyName("nextSyncAt")]
        DateTimeOffset? NextSyncAt = null,
        [property: JsonPropertyName("errorMessage")]
        string? ErrorMessage = null,
        [property: JsonPropertyName("importedBookingsCount")]
        int ImportedBookingsCount = 0);
}
