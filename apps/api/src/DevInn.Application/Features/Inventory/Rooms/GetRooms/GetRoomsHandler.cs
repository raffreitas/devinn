using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

internal sealed class GetRoomsHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<GetRoomsQuery, Result<PaginatedResult<RoomResponse>>>
{
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

        const string sql = $"""
                            SELECT r.id                      AS "{nameof(RoomResponse.Id)}",
                                   r.number                  AS "{nameof(RoomResponse.Number)}",
                                   r.name                    AS "{nameof(RoomResponse.Name)}",
                                   r.status                  AS "{nameof(RoomResponse.Status)}",
                                   r.category_id             AS "{nameof(RoomResponse.CategoryId)}",
                                   rc.name                   AS "{nameof(RoomResponse.CategoryName)}",
                                   rc.max_capacity           AS "{nameof(RoomResponse.Capacity)}",
                                   rc.base_price             AS "{nameof(RoomResponse.BasePrice)}",
                                   rc.person_price           AS "{nameof(RoomResponse.ExtraGuestPrice)}",
                                   COALESCE(ci_count.total, 0) AS "{nameof(RoomResponse.ActiveIntegrationsCount)}"
                            FROM rooms r
                            JOIN room_categories rc ON r.category_id = rc.Id
                                AND rc.inn_id = r.inn_id
                            LEFT JOIN (
                                SELECT room_id, COUNT(*) as total
                                FROM channel_integrations
                                WHERE is_active = true AND inn_id = @TenantId
                                GROUP BY room_id
                            ) ci_count ON ci_count.room_id = r.id
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

        var rooms = await connection.QueryAsync<RoomResponse>(
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
            rooms.ToArray(),
            count,
            query.PageNumber,
            query.PageSize
        );
        return Result.Ok(paginatedResult);
    }
}