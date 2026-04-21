using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Bookings.Commands.DeleteBooking;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Commands.DeleteBooking;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class DeleteBookingHandlerTests
{
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IUserContext _userContext = Substitute.For<IUserContext>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly DeleteBookingHandler _sut;

    public DeleteBookingHandlerTests()
    {
        _userContext.UserId.Returns(Guid.Parse("11111111-1111-1111-1111-111111111111"));
        _sut = new DeleteBookingHandler(_bookingRepository, _userContext, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenBookingDoesNotExist()
    {
        var command = new DeleteBookingCommand(Guid.NewGuid());
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Reserva não encontrada.");
    }

    [Fact]
    public async Task Handle_ShouldSoftDeleteBookingAndCommit_WhenBookingExists()
    {
        var booking = CreateBooking();
        var command = new DeleteBookingCommand(booking.Id);
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        booking.IsDeleted.ShouldBeTrue();
        booking.DeletedBy.ShouldBe(_userContext.UserId);
        await _bookingRepository.DidNotReceive().RemoveAsync(Arg.Any<Booking>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    private static Booking CreateBooking()
    {
        return new Booking(
            roomId: Guid.NewGuid(),
            guest: new Guest("Guest", "11999999999"),
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(2)),
            occupancy: new Occupancy(1, 0),
            totalValue: new Money(100m),
            source: BookingSource.Manual);
    }
}
