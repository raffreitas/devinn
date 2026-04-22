using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Bookings.Shared;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.GetBookingById;

internal sealed class GetBookingByIdHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<GetBookingByIdQuery, Result<BookingDto>>
{
    public async ValueTask<Result<BookingDto>> Handle(GetBookingByIdQuery query, CancellationToken cancellationToken)
    {
        string sql = $"""
                      {BookingMapper.BookingProjectionSql}
                      WHERE b.inn_id = @TenantId
                        AND b.deleted_at IS NULL
                        AND b.id = @Id
                      LIMIT 1;
                      """;

        const string latestAuditSql = """
                                      SELECT entity_id   AS "EntityId",
                                             action      AS "Action",
                                             occurred_at AS "OccurredAt",
                                             summary     AS "Summary"
                                      FROM audit_logs
                                      WHERE inn_id = @TenantId
                                        AND entity_name = 'Booking'
                                        AND entity_id = @Id
                                      ORDER BY occurred_at DESC
                                      LIMIT 1;
                                      """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var r = await connection.QueryFirstOrDefaultAsync<BookingProjection>(sql,
            new { TenantId = tenantContext.Tenant.Id, query.Id });

        if (r is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada."));

        var payments = await connection
            .QueryAsync<PaymentProjection>(BookingMapper.PaymentProjectionSql, new { BookingId = r.Id });
        var latestAudit = await connection.QueryFirstOrDefaultAsync<AuditLogProjection>(
            latestAuditSql,
            new { TenantId = tenantContext.Tenant.Id, query.Id });

        return BookingMapper.MapToDto(r, BookingMapper.MapPayments(payments), BookingMapper.MapAudit(latestAudit));
    }
}