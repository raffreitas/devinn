using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Enums;

using FluentResults;

using Mediator;

using System.Text.Json;

using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Bookings.Queries.GetBookingById;

internal sealed class GetBookingByIdHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<GetBookingByIdQuery, Result<BookingDto>>
{
    public async ValueTask<Result<BookingDto>> Handle(GetBookingByIdQuery query, CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT b.id                      AS "Id",
                                  b.room_id                 AS "RoomId",
                                  r.number                  AS "Number",
                                  rc.name                   AS "CategoryName",
                                  rc.base_price             AS "BasePrice",
                                  rc.extra_person_price     AS "ExtraPersonPrice",
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
                                  b.status                  AS "Status",
                                  b.notes                   AS "Notes"
                           FROM bookings b
                           JOIN rooms r ON r.id = b.room_id AND r.inn_id = b.inn_id
                           JOIN room_categories rc ON rc.id = r.category_id AND rc.inn_id = b.inn_id
                           WHERE b.inn_id = @TenantId
                             AND b.id = @Id
                           LIMIT 1;
                           """;

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

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var r = await connection.QueryFirstOrDefaultAsync<BookingProjection>(sql,
            new { TenantId = tenantContext.Tenant.Id, query.Id });

        if (r is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada."));

        var payments = await connection.QueryAsync<PaymentProjection>(paymentsSql, new { BookingId = r.Id });
        var paymentsList = payments.Select(p => new PaymentDto(p.Id, p.Amount,
            Enum.Parse<PaymentMethod>(p.Method), p.PaymentDate, p.Notes)).ToArray();

        decimal paidValue = paymentsList.Sum(p => p.Amount);

        int[]? childrenAges = null;
        if (!string.IsNullOrWhiteSpace(r.ChildrenAges))
        {
            childrenAges = JsonSerializer.Deserialize<int[]>(r.ChildrenAges!);
        }

        var paymentStatus = paidValue == 0m ? PaymentStatus.Pending :
            paidValue < r.TotalValue ? PaymentStatus.Partial : PaymentStatus.Paid;

        var nights = (int)(r.CheckOut - r.CheckIn).TotalDays;

        var numberOfExtraGuests = Math.Max(0, r.Adults - 2);

        var pricing = new PricingBreakdown(r.BasePrice, r.ExtraPersonPrice, nights, numberOfExtraGuests,
            r.TotalValue, 0m, r.TotalValue);

        var guest = new GuestDto(r.GuestName, r.GuestPhone, r.GuestEmail, r.GuestDocument, r.GuestBirthDate);

        var booking = new BookingDto(
            r.Id,
            r.RoomId,
            r.Number.ToString(),
            r.CategoryName,
            guest,
            r.CheckIn,
            r.CheckOut,
            r.Adults,
            r.Children,
            childrenAges,
            pricing,
            Enum.Parse<BookingStatus>(r.Status),
            paymentStatus,
            paidValue,
            r.TotalValue - paidValue,
            paymentsList,
            r.Notes
        );

        return booking;
    }
}