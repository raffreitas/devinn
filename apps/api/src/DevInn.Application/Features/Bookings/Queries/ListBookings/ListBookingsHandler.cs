using System.Text.Json;

using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Enums;
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
                                SELECT count(1)
                                FROM bookings b
                                WHERE b.inn_id = @TenantId
                                    AND (@Status IS NULL OR b.status = @Status)
                                    AND (@StartDate IS NULL OR b.check_out > @StartDate)
                                    AND (@EndDate IS NULL OR b.check_in < @EndDate)
                                    AND (
                                        @PaymentStatus IS NULL
                                        OR (@PaymentStatus = 'Pending' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) = 0)
                                        OR (@PaymentStatus = 'Partial' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) > 0 AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) < b.total_value)
                                        OR (@PaymentStatus = 'Paid' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) >= b.total_value)
                                    )
                                """;

        const string sql = """
                           SELECT b.id                      AS "Id",
                                  b.room_id                 AS "RoomId",
                                  r.number                  AS "Number",
                                  rc.name                   AS "CategoryName",
                                  rc.base_price             AS "BasePrice",
                                  rc.person_price           AS "ExtraPersonPrice",
                                  b.guest_name              AS "GuestName",
                                  b.guest_phone             AS "GuestPhone",
                                  b.guest_email             AS "GuestEmail",
                                  b.guest_document          AS "GuestDocument",
                                  b.guest_birth_date        AS "GuestBirthDate",
                                  b.check_in                AS "CheckIn",
                                  b.check_out               AS "CheckOut",
                                  b.adults                  AS "Adults",
                                  b.children                AS "Children",
                                  b.children_ages           AS "ChildrenAges",
                                  b.total_value             AS "TotalValue",
                                  COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) AS "PaidValue",
                                  b.status                  AS "Status",
                                  b.source                  AS "Source",
                                  b.notes                   AS "Notes"
                           FROM bookings b
                           JOIN rooms r ON r.id = b.room_id AND r.inn_id = b.inn_id
                           JOIN room_categories rc ON rc.id = r.category_id AND rc.inn_id = b.inn_id
                           WHERE b.inn_id = @TenantId
                               AND (@Status IS NULL OR b.status = @Status)
                               AND (@StartDate IS NULL OR b.check_out > @StartDate)
                               AND (@EndDate IS NULL OR b.check_in < @EndDate)
                               AND (
                                   @PaymentStatus IS NULL
                                   OR (@PaymentStatus = 'Pending' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) = 0)
                                   OR (@PaymentStatus = 'Partial' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) > 0 AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) < b.total_value)
                                   OR (@PaymentStatus = 'Paid' AND COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) >= b.total_value)
                               )
                           ORDER BY b.check_in
                           OFFSET @Offset
                           LIMIT @PageSize;
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var count = await connection.ExecuteScalarAsync<int>(countSql,
            new
            {
                TenantId = tenantContext.Tenant.Id,
                Status = query.Status?.ToString(),
                PaymentStatus = query.PaymentStatus?.ToString(),
                query.StartDate,
                query.EndDate
            });

        var rows = await connection.QueryAsync<BookingProjection>(sql,
            new
            {
                TenantId = tenantContext.Tenant.Id,
                Status = query.Status?.ToString(),
                query.StartDate,
                query.EndDate,
                PaymentStatus = query.PaymentStatus?.ToString(),
                query.PageSize,
                query.Offset
            });

        const string paymentsSql = """
                                   SELECT id            AS "Id",
                                          amount        AS "Amount",
                                          method        AS "Method",
                                          payment_date  AS "PaymentDate",
                                          notes         AS "Notes"
                                   FROM payments
                                   WHERE booking_id = @BookingId
                                   ORDER BY payment_date DESC;
                                   """;

        var itemsList = new List<BookingDto>();
        foreach (var r in rows)
        {
            int[]? childrenAges = null;
            if (!string.IsNullOrWhiteSpace(r.ChildrenAges))
            {
                childrenAges = JsonSerializer.Deserialize<int[]>(r.ChildrenAges!);
            }

            var payments = await connection.QueryAsync<PaymentProjection>(paymentsSql, new { BookingId = r.Id });
            var paymentsList = payments.Select(p =>
                new PaymentDto(p.Id, p.Amount, Enum.Parse<PaymentMethod>(p.Method), p.PaymentDate, p.Notes)).ToArray();

            var paymentStatus = paymentsList.Length == 0 ? PaymentStatus.Pending
                : paymentsList.Sum(p => p.Amount) < r.TotalValue ? PaymentStatus.Partial : PaymentStatus.Paid;

            var nights = (int)(r.CheckOut - r.CheckIn).TotalDays;
            var numberOfExtraGuests = Math.Max(0, r.Adults - 2);

            var pricing = new PricingBreakdown(r.BasePrice, r.ExtraPersonPrice, nights, numberOfExtraGuests,
                r.TotalValue, 0m, r.TotalValue);

            GuestDto? guest = null;
            if (!string.IsNullOrWhiteSpace(r.GuestName))
            {
                guest = new GuestDto(
                    r.GuestName,
                    r.GuestPhone,
                    r.GuestEmail,
                    r.GuestDocument,
                    r.GuestBirthDate
                );
            }

            itemsList.Add(new BookingDto(
                r.Id,
                r.RoomId,
                r.Number.ToString(),
                r.CategoryName,
                guest,
                Enum.Parse<BookingSource>(r.Source),
                r.CheckIn,
                r.CheckOut,
                r.Adults,
                r.Children,
                childrenAges,
                pricing,
                Enum.Parse<BookingStatus>(r.Status),
                paymentStatus,
                r.PaidValue,
                r.TotalValue - r.PaidValue,
                paymentsList,
                r.Notes
            ));
        }

        var items = itemsList.ToArray();

        return new PaginatedResult<BookingDto>(items, count, query.PageNumber, query.PageSize);
    }
}