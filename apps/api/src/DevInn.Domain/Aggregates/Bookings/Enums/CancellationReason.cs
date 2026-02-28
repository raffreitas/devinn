namespace DevInn.Domain.Aggregates.Bookings.Enums;

public enum CancellationReason
{
    Manual = 1,
    ExternalCancellation = 2,
    NoShow = 3,
    Other = 4
}