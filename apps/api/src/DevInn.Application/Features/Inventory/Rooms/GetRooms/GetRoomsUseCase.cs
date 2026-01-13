using Dapper;

using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public interface IGetRoomsUseCase : IUseCase<GetRoomsInput, Result<PaginatedResult<RoomResponse>>>;

internal sealed class GetRoomsUseCase(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IGetRoomsUseCase
{
    public async ValueTask<Result<PaginatedResult<RoomResponse>>> ExecuteAsync(
        GetRoomsInput input,
        CancellationToken cancellationToken = default)
    {
        const string countSql = """
                                SELECT count(1)
                                FROM rooms r
                                WHERE r.inn_id = @TenantId;
                                """;

        const string sql = """
                           SELECT r.id          AS "Id",
                                  r.category_id AS "CategoryId",
                                  r.Number      AS "Number",
                                  r.Name        AS "Name",
                                  r.Status      AS "Status",
                                  rc.Name       AS "CategoryName"
                           FROM rooms r
                           JOIN room_categories rc ON r.CategoryId = rc.Id
                                AND rc.inn_id = r.inn_id
                           WHERE r.inn_id = @TenantId
                           ORDER BY r.Number
                           OFFSET @Offset
                           LIMIT @PageSize;
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        await connection.OpenAsync(cancellationToken);

        var count = await connection.ExecuteScalarAsync<int>(countSql, new { TenantId = tenantContext.Tenant.Id });

        var rooms = await connection.QueryAsync<RoomResponse>(
            sql,
            new { TenantId = tenantContext.Tenant.Id, input.PageSize, input.Offset }
        );

        var paginatedResult = new PaginatedResult<RoomResponse>(
            rooms.ToArray(),
            count,
            input.PageNumber,
            input.PageSize
        );
        return Result.Ok(paginatedResult);
    }
}