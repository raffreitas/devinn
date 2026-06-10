using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Bookings.Commands.UpdateBookingReconciliationStatus;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Commands.UpdateBookingReconciliationStatus;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateBookingReconciliationStatusCommandHandlerTests
{
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly UpdateBookingReconciliationStatusCommandHandler _sut;

    public UpdateBookingReconciliationStatusCommandHandlerTests()
    {
        _sut = new UpdateBookingReconciliationStatusCommandHandler(_bookingRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenBookingDoesNotExist()
    {
        var command = new UpdateBookingReconciliationStatusCommand(
            Guid.NewGuid(),
            BookingReconciliationStatus.IgnoredExternalBlock);
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
    }

    [Fact]
    public async Task Handle_ShouldIgnoreExternalBlockAndCommit_WhenCommandIsValid()
    {
        var booking = CreateICalBlock();
        var command = new UpdateBookingReconciliationStatusCommand(
            booking.Id,
            BookingReconciliationStatus.IgnoredExternalBlock);
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        booking.ReconciliationStatus.ShouldBe(BookingReconciliationStatus.IgnoredExternalBlock);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenStatusIsNotIgnoredExternalBlock()
    {
        var booking = CreateICalBlock();
        var command = new UpdateBookingReconciliationStatusCommand(
            booking.Id,
            BookingReconciliationStatus.Reconciled);
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ValidationError>();
        await _uow.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
    }

    private static Booking CreateICalBlock()
        => new(
            roomId: Guid.NewGuid(),
            guest: null,
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(3)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal);
}
