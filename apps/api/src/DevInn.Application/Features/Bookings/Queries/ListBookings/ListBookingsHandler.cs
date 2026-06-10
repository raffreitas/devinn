using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.ListBookings;

internal sealed class ListBookingsHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<ListBookingsQuery, Result<PaginatedResult<BookingDto>>>
{
    public async ValueTask<Result<PaginatedResult<BookingDto>>> Handle(ListBookingsQuery query,
        CancellationToken cancellationToken)
    {
        const string countSql = """
                                WITH paid_amounts AS (
                                    SELECT booking_id, COALESCE(SUM(amount), 0) AS total
                                    FROM payments
                                    GROUP BY booking_id
                                )
                                 SELECT count(1)
                                 FROM bookings b
                                 LEFT JOIN paid_amounts pa ON pa.booking_id = b.id
                                 WHERE b.inn_id = @TenantId
                                     AND b.deleted_at IS NULL
                                     AND (@Status IS NULL OR b.status = @Status)
                                     AND (@ReconciliationStatus IS NULL OR b.reconciliation_status = @ReconciliationStatus)
                                     AND (@StartDate IS NULL OR b.check_out > @StartDate)
                                     AND (@EndDate IS NULL OR b.check_in < @EndDate)
                                    AND (
                                        @PaymentStatus IS NULL
                                        OR (@PaymentStatus = 'Pending' AND COALESCE(pa.total, 0) = 0)
                                        OR (@PaymentStatus = 'Partial' AND COALESCE(pa.total, 0) > 0 AND COALESCE(pa.total, 0) < b.total_value)
                                        OR (@PaymentStatus = 'Paid' AND COALESCE(pa.total, 0) >= b.total_value)
                                    )
                                """;

        string sql = $"""
                      WITH paid_amounts AS (
                          SELECT booking_id, COALESCE(SUM(amount), 0) AS total
                          FROM payments
                          GROUP BY booking_id
                      )
                       {BookingMapper.BookingProjectionSql}
                       LEFT JOIN paid_amounts pa ON pa.booking_id = b.id
                       WHERE b.inn_id = @TenantId
                           AND b.deleted_at IS NULL
                           AND (@Status IS NULL OR b.status = @Status)
                           AND (@ReconciliationStatus IS NULL OR b.reconciliation_status = @ReconciliationStatus)
                           AND (@StartDate IS NULL OR b.check_out > @StartDate)
                           AND (@EndDate IS NULL OR b.check_in < @EndDate)
                          AND (
                              @PaymentStatus IS NULL
                              OR (@PaymentStatus = 'Pending' AND COALESCE(pa.total, 0) = 0)
                              OR (@PaymentStatus = 'Partial' AND COALESCE(pa.total, 0) > 0 AND COALESCE(pa.total, 0) < b.total_value)
                              OR (@PaymentStatus = 'Paid' AND COALESCE(pa.total, 0) >= b.total_value)
                          )
                      ORDER BY b.check_in
                      OFFSET @Offset
                      LIMIT @PageSize;
                      """;

        const string batchPaymentsSql = """
                                        SELECT booking_id   AS "BookingId",
                                               id            AS "Id",
                                               amount        AS "Amount",
                                               method        AS "Method",
                                               payment_date  AS "PaymentDate",
                                               notes         AS "Notes"
                                        FROM payments
                                        WHERE booking_id = ANY(@BookingIds)
                                        ORDER BY payment_date DESC;
                                        """;

        const string latestAuditsSql = """
                                       WITH ranked_audits AS (
                                           SELECT entity_id,
                                                  action,
                                                  occurred_at,
                                                  summary,
                                                  ROW_NUMBER() OVER (
                                                      PARTITION BY entity_id
                                                      ORDER BY occurred_at DESC
                                                  ) AS rn
                                           FROM audit_logs
                                           WHERE inn_id = @TenantId
                                             AND entity_name = 'Booking'
                                             AND entity_id = ANY(@BookingIds)
                                       )
                                       SELECT entity_id   AS "EntityId",
                                              action      AS "Action",
                                              occurred_at AS "OccurredAt",
                                              summary     AS "Summary"
                                       FROM ranked_audits
                                       WHERE rn = 1;
                                       """;

        var parameters = new
        {
            TenantId = tenantContext.Tenant.Id,
            Status = query.Status?.ToString(),
            ReconciliationStatus = query.ReconciliationStatus?.ToString(),
            PaymentStatus = query.PaymentStatus?.ToString(),
            query.StartDate,
            query.EndDate,
            query.PageSize,
            query.Offset
        };

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);

        var count = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var rows = (await connection.QueryAsync<BookingProjection>(sql, parameters)).ToArray();

        if (rows.Length == 0)
            return new PaginatedResult<BookingDto>([], count, query.PageNumber, query.PageSize);

        var bookingIds = rows.Select(r => r.Id).ToArray();
        var allPayments = await connection
            .QueryAsync<BatchPaymentProjection>(batchPaymentsSql, new { BookingIds = bookingIds });
        var latestAudits = await connection.QueryAsync<AuditLogProjection>(
            latestAuditsSql,
            new { TenantId = tenantContext.Tenant.Id, BookingIds = bookingIds });

        var paymentsByBooking = allPayments
            .GroupBy(p => p.BookingId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(p =>
                        new PaymentDto(p.Id, p.Amount, Enum.Parse<PaymentMethod>(p.Method), p.PaymentDate, p.Notes))
                    .ToArray());
        var auditsByBooking = latestAudits.ToDictionary(a => a.EntityId);

        var items = rows
            .Select(r => BookingMapper.MapToDto(
                r,
                paymentsByBooking.GetValueOrDefault(r.Id, []),
                BookingMapper.MapAudit(auditsByBooking.GetValueOrDefault(r.Id))))
            .ToArray();

        return new PaginatedResult<BookingDto>(items, count, query.PageNumber, query.PageSize);
    }

    private sealed record BatchPaymentProjection
    {
        public Guid BookingId { get; init; }
        public Guid Id { get; init; }
        public decimal Amount { get; init; }
        public string Method { get; init; } = null!;
        public DateTimeOffset PaymentDate { get; init; }
        public string? Notes { get; init; }
    }
}
