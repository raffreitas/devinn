using DevInn.Domain.Aggregates.Bookings.Entities;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Shouldly;

namespace DevInn.UnitTests.Domain.Aggregates.Bookings.Entities;

[Trait("Category", "Unit")]
[Trait("Category", "Domain")]
public sealed class PaymentTests
{
    [Fact]
    public void Constructor_ShouldCreatePayment_WhenValidData()
    {
        var payment = new Payment(
            bookingId: Guid.NewGuid(),
            amount: new Money(120m),
            method: PaymentMethod.Pix,
            paymentDate: DateTimeOffset.UtcNow,
            notes: "Entrada");

        payment.Amount.ShouldBe(new Money(120m));
        payment.Method.ShouldBe(PaymentMethod.Pix);
        payment.Notes.ShouldBe("Entrada");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenAmountIsNotPositive()
    {
        Should.Throw<DomainException>(() => new Payment(
                bookingId: Guid.NewGuid(),
                amount: new Money(0m),
                method: PaymentMethod.Cash,
                paymentDate: DateTimeOffset.UtcNow))
            .Message.ShouldBe("O valor do pagamento deve ser maior que zero.");
    }
}
