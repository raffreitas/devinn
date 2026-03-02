using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Bookings;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class BookingTests
{
    [Fact]
    public void Constructor_ShouldCreateBooking_WhenValidParameters()
    {
        var booking = CreateRegularBooking();

        booking.Status.ShouldBe(BookingStatus.Scheduled);
        booking.IsRealBooking.ShouldBeTrue();
        booking.NumberOfNights.ShouldBe(2);
        booking.PaymentStatus.ShouldBe(PaymentStatus.Pending);
    }

    [Fact]
    public void Update_ShouldThrow_WhenBookingIsBlock()
    {
        var block = CreateBlockBooking();

        Should.Throw<DomainException>(() => block.Update(
                Guid.NewGuid(),
                CreateGuest(),
                new StayPeriod(DateTimeOffset.UtcNow.AddDays(3), DateTimeOffset.UtcNow.AddDays(5)),
                new Occupancy(2, 0),
                new Money(300m),
                BookingSource.Manual))
            .Message.ShouldBe("Bloqueios não podem ser editados. Apenas exclua e recrie se necessário.");
    }

    [Fact]
    public void Enrich_ShouldPopulateBlock_WhenBookingIsBlock()
    {
        var block = CreateBlockBooking();
        var guest = CreateGuest();
        var occupancy = new Occupancy(2, 1, [5]);

        block.Enrich(guest, occupancy, "Reserva enriquecida", new Money(450m));

        block.IsRealBooking.ShouldBeTrue();
        block.Guest.ShouldBe(guest);
        block.Occupancy.ShouldBe(occupancy);
        block.TotalValue.ShouldBe(new Money(450m));
    }

    [Fact]
    public void AddPayment_ShouldThrow_WhenAmountIsZero()
    {
        var booking = CreateRegularBooking();

        Should.Throw<DomainException>(() =>
                booking.AddPayment(new Money(0m), PaymentMethod.Pix, DateTimeOffset.UtcNow))
            .Message.ShouldBe("O valor do pagamento deve ser maior que zero.");
    }

    [Fact]
    public void AddPayment_ShouldUpdatePaymentStatus_WhenPartialAndFullPayments()
    {
        var booking = CreateRegularBooking(total: 500m);

        booking.AddPayment(new Money(100m), PaymentMethod.Pix, DateTimeOffset.UtcNow);
        booking.PaymentStatus.ShouldBe(PaymentStatus.Partial);
        booking.BalanceDue.ShouldBe(400m);

        booking.AddPayment(new Money(400m), PaymentMethod.CreditCard, DateTimeOffset.UtcNow);
        booking.PaymentStatus.ShouldBe(PaymentStatus.Paid);
        booking.BalanceDue.ShouldBe(0m);
    }

    [Fact]
    public void Cancel_ShouldBeIdempotent_WhenAlreadyCanceled()
    {
        var booking = CreateRegularBooking();

        booking.Cancel(CancellationReason.Manual);
        booking.Cancel(CancellationReason.NoShow);

        booking.Status.ShouldBe(BookingStatus.Canceled);
        booking.CancellationReason.ShouldBe(CancellationReason.Manual);
    }

    private static Booking CreateRegularBooking(decimal total = 300m)
    {
        return new Booking(
            roomId: Guid.NewGuid(),
            guest: CreateGuest(),
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(3)),
            occupancy: new Occupancy(2, 0),
            totalValue: new Money(total),
            source: BookingSource.Manual,
            notes: "Teste");
    }

    private static Booking CreateBlockBooking()
    {
        return new Booking(
            roomId: Guid.NewGuid(),
            guest: null,
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(3)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal);
    }

    private static Guest CreateGuest()
        => new("Fulano", "11999999999", "fulano@test.com", "12345678900");
}
