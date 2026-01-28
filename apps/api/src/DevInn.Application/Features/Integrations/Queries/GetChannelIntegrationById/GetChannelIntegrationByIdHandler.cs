using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;
using DevInn.Domain.Aggregates.Integrations.Enums;

using FluentResults;

using Mediator;

using System.Text.Json;

namespace DevInn.Application.Features.Integrations.Queries.GetChannelIntegrationById;

internal sealed class GetChannelIntegrationByIdHandler(
    IDbConnectionFactory dbConnectionFactory,
    ITenantContext tenantContext)
    : IQueryHandler<GetChannelIntegrationByIdQuery, Result<ChannelIntegrationDto>>
{
    public async ValueTask<Result<ChannelIntegrationDto>> Handle(
        GetChannelIntegrationByIdQuery query,
        CancellationToken cancellationToken)
    {
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
                           WHERE ci.id = @Id AND ci.inn_id = @TenantId
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);

        var result =
            await connection.QuerySingleOrDefaultAsync<IntegrationRaw>(sql,
                new { query.Id, TenantId = tenantContext.Tenant.Id });

        if (result is null)
            return Result.Fail(new NotFoundError("Integração não encontrada"));

        var syncStatusValue = JsonSerializer.Deserialize<SyncStatusJson>(result.SyncStatus) ?? new SyncStatusJson();
        var channelType = Enum.Parse<ChannelType>(result.ChannelType, ignoreCase: true);

        var dto = new ChannelIntegrationDto(
            result.Id,
            channelType,
            result.ICalUrl,
            result.RoomId,
            result.RoomName.ToString(),
            result.IsActive,
            new SyncStatusDto(
                syncStatusValue.Status ?? "NeverSynced",
                syncStatusValue.LastSyncAt,
                syncStatusValue.NextSyncAt,
                syncStatusValue.ErrorMessage,
                syncStatusValue.ImportedBookingsCount),
            new DateTimeOffset(result.CreatedAt, TimeSpan.Zero),
            new DateTimeOffset(result.UpdatedAt, TimeSpan.Zero));

        return Result.Ok(dto);
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