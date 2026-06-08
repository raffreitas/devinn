using System.Text.Json;

using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Shared.Enums;

namespace DevInn.Application.Features.Bookings.Shared;

internal static class BookingMapper
{
    internal const string BookingProjectionSql = """
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
       b.status                  AS "Status",
       b.reconciliation_status   AS "ReconciliationStatus",
       b.source                  AS "Source",
       b.notes                   AS "Notes",
       b.created_at              AS "CreatedAt",
       b.updated_at              AS "UpdatedAt"
FROM bookings b
JOIN rooms r ON r.id = b.room_id AND r.inn_id = b.inn_id
JOIN room_categories rc ON rc.id = r.category_id AND rc.inn_id = b.inn_id
""";

    internal const string PaymentProjectionSql = """
SELECT id            AS "Id",
       amount        AS "Amount",
       method        AS "Method",
       payment_date  AS "PaymentDate",
       notes         AS "Notes"
FROM payments
WHERE booking_id = @BookingId
ORDER BY payment_date DESC;
""";

    internal static BookingDto MapToDto(BookingProjection r, PaymentDto[] payments, AuditSummaryDto? lastAudit = null)
    {
        var paidValue = payments.Sum(p => p.Amount);
        var paymentStatus = ToPaymentStatus(paidValue, r.TotalValue);
        var nights = (int)(r.CheckOut - r.CheckIn).TotalDays;
        var numberOfExtraGuests = Math.Max(0, r.Adults - 2);

        var pricing = new PricingBreakdown(
            r.BasePrice,
            r.ExtraPersonPrice,
            nights,
            numberOfExtraGuests,
            r.TotalValue,
            0m,
            r.TotalValue);

        return new BookingDto(
            r.Id,
            r.RoomId,
            r.Number.ToString(),
            r.CategoryName,
            ToGuestDto(r),
            Enum.Parse<BookingSource>(r.Source),
            r.CheckIn,
            r.CheckOut,
            r.Adults,
            r.Children,
            DeserializeChildrenAges(r.ChildrenAges),
            pricing,
            Enum.Parse<BookingStatus>(r.Status),
            string.IsNullOrWhiteSpace(r.ReconciliationStatus)
                ? null
                : Enum.Parse<BookingReconciliationStatus>(r.ReconciliationStatus),
            paymentStatus,
            paidValue,
            r.TotalValue - paidValue,
            payments,
            r.Notes,
            r.CreatedAt,
            r.UpdatedAt,
            lastAudit);
    }

    internal static PaymentDto[] MapPayments(IEnumerable<PaymentProjection> projections)
        => projections
            .Select(p => new PaymentDto(p.Id, p.Amount, Enum.Parse<PaymentMethod>(p.Method), p.PaymentDate, p.Notes))
            .ToArray();

    internal static AuditSummaryDto? MapAudit(AuditLogProjection? projection)
        => projection is null
            ? null
            : new AuditSummaryDto(projection.Action, projection.OccurredAt, projection.Summary);

    private static PaymentStatus ToPaymentStatus(decimal paidValue, decimal totalValue)
        => paidValue == 0m ? PaymentStatus.Pending
            : paidValue < totalValue ? PaymentStatus.Partial
            : PaymentStatus.Paid;

    private static GuestDto? ToGuestDto(BookingProjection r)
        => string.IsNullOrWhiteSpace(r.GuestName)
            ? null
            : new GuestDto(r.GuestName, r.GuestPhone, r.GuestEmail, r.GuestDocument, r.GuestBirthDate);

    private static int[]? DeserializeChildrenAges(string? raw)
        => string.IsNullOrWhiteSpace(raw) ? null : JsonSerializer.Deserialize<int[]>(raw);
}
