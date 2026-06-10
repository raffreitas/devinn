using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Bookings.Commands.UpdateBooking;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Commands.UpdateBooking;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateBookingCommandHandlerTests
{
    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IRoomCategoryRepository _categoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IPricingCalculatorService _pricingCalculatorService = Substitute.For<IPricingCalculatorService>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly UpdateBookingCommandHandler _sut;

    public UpdateBookingCommandHandlerTests()
    {
        _sut = new UpdateBookingCommandHandler(
            _roomRepository,
            _categoryRepository,
            _bookingRepository,
            _pricingCalculatorService,
            _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenBookingDoesNotExist()
    {
        var command = CreateValidCommand();
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Reserva não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenRegularBookingCommandIsInvalid()
    {
        var booking = CreateRegularBooking();
        var command = CreateValidCommand() with { Id = booking.Id, Guest = null };
        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ValidationError>();
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenCapacityIsExceeded()
    {
        var booking = CreateRegularBooking();
        var room = new Room(Guid.NewGuid(), 101);
        var category = new RoomCategory("Suite", "Desc", 2, new PricingPolicy(200m, 50m));
        var command = CreateValidCommand() with
        {
            Id = booking.Id,
            RoomId = room.Id,
            Adults = 2,
            Children = 1,
            ChildrenAges = [4]
        };

        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).Returns(category);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
        result.Errors[0].Message.ShouldBe("Número de hóspedes excede a capacidade do quarto.");
    }

    [Fact]
    public async Task Handle_ShouldEnrichBlockAndCommit_WhenBlockHasGuestData()
    {
        var booking = CreateBlockBooking();
        var room = new Room(Guid.NewGuid(), 102);
        room.SetTenantId(Guid.NewGuid());
        var category = new RoomCategory("Suite", "Desc", 4, new PricingPolicy(200m, 50m));
        var command = CreateValidCommand() with
        {
            Id = booking.Id,
            RoomId = room.Id,
            Source = BookingSource.BookingIcal
        };

        _bookingRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(booking);
        _roomRepository.GetByIdAsync(booking.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).Returns(category);
        _pricingCalculatorService.CalculateBreakdown(booking.StayPeriod, category, Arg.Any<Occupancy>())
            .Returns(new DevInn.Domain.Aggregates.Bookings.Abstractions.PricingBreakdown(
                new Money(200m), new Money(100m), 1, new Money(0m), new Money(250m), 2, new Money(500m)));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        booking.IsRealBooking.ShouldBeTrue();
        booking.ReconciliationStatus.ShouldBe(BookingReconciliationStatus.Reconciled);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    private static UpdateBookingCommand CreateValidCommand()
    {
        return new UpdateBookingCommand(
            Id: Guid.NewGuid(),
            Guest: new GuestDto("Hóspede", "11999999999", "hospede@test.com", "12345678900"),
            RoomId: Guid.NewGuid(),
            CheckIn: DateTimeOffset.UtcNow.AddDays(2),
            CheckOut: DateTimeOffset.UtcNow.AddDays(5),
            Adults: 2,
            Children: 0,
            ChildrenAges: [],
            Notes: "Atualização",
            Source: BookingSource.Manual,
            PaidAmount: 50m,
            PaymentMethod: PaymentMethod.Pix);
    }

    private static Booking CreateRegularBooking()
    {
        return new Booking(
            roomId: Guid.NewGuid(),
            guest: new Guest("Fulano", "11999999999", "fulano@test.com", "12345678900"),
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(3)),
            occupancy: new Occupancy(2, 0),
            totalValue: new Money(300m),
            source: BookingSource.Manual);
    }

    private static Booking CreateBlockBooking()
    {
        return new Booking(
            roomId: Guid.NewGuid(),
            guest: null,
            stayPeriod: new StayPeriod(DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(4)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal);
    }
}
