namespace DevInn.Domain.Aggregates.Bookings.Enums;

public enum BookingReconciliationStatus
{
    Imported = 1,
    NeedsReview,
    Reconciled,
    IgnoredExternalBlock
}
