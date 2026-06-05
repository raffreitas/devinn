using Bogus;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Bookings.Commands.CreateBooking;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Commands.CreateBooking;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateBookingHandlerTests
{
    private readonly Faker _faker = new();

    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IRoomCategoryRepository _categoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IPricingCalculatorService _pricingCalculatorService = Substitute.For<IPricingCalculatorService>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateBookingHandler _sut;

    public CreateBookingHandlerTests()
    {
        _sut = new CreateBookingHandler(
            _roomRepository,
            _categoryRepository,
            _bookingRepository,
            _pricingCalculatorService,
            _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenRoomDoesNotExist()
    {
        var command = CreateValidCommand(Guid.NewGuid());
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Quarto não encontrado");
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        var room = new Room(Guid.NewGuid(), 101);
        var command = CreateValidCommand(room.Id);
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Categoria do quarto não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenCapacityIsExceeded()
    {
        var room = new Room(Guid.NewGuid(), 101);
        var category = new RoomCategory("Luxo", "Desc", 2, new PricingPolicy(200m, 50m));
        var command = CreateValidCommand(room.Id) with { Adults = 2, Children = 1, ChildrenAges = [7] };
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).Returns(category);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
        result.Errors[0].Message.ShouldBe("Número de hóspedes excede a capacidade do quarto.");
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenRoomIsNotActive()
    {
        var room = new Room(Guid.NewGuid(), 101, status: RoomStatus.Inactive);
        var command = CreateValidCommand(room.Id) with { Adults = 2, Children = 1, ChildrenAges = [7] };
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
        result.Errors[0].Message.ShouldBe("O quarto selecionado não está disponível para reserva.");
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenRoomHasOverlappingBooking()
    {
        var room = new Room(Guid.NewGuid(), 101);
        var category = new RoomCategory("Luxo", "Desc", 4, new PricingPolicy(200m, 50m));
        var command = CreateValidCommand(room.Id);
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).Returns(category);
        _bookingRepository.HasOverlappingAsync(room.Id, Arg.Any<DateTimeOffset>(), Arg.Any<DateTimeOffset>(),
                null, TestContext.Current.CancellationToken)
            .Returns(true);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
        result.Errors[0].Message.ShouldBe("O quarto não está disponível nas datas solicitadas.");
    }

    [Fact]
    public async Task Handle_ShouldPersistBookingAndCommit_WhenCommandIsValid()
    {
        var room = new Room(Guid.NewGuid(), 101);
        var category = new RoomCategory("Luxo", "Desc", 4, new PricingPolicy(200m, 50m));
        var command = CreateValidCommand(room.Id) with { PaidAmount = 100m, PaymentMethod = PaymentMethod.Pix };

        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _categoryRepository.GetByIdAsync(room.CategoryId, TestContext.Current.CancellationToken).Returns(category);
        _bookingRepository.HasOverlappingAsync(room.Id, Arg.Any<DateTimeOffset>(), Arg.Any<DateTimeOffset>(),
                null, TestContext.Current.CancellationToken)
            .Returns(false);
        _pricingCalculatorService.CalculateBreakdown(Arg.Any<StayPeriod>(), category, Arg.Any<Occupancy>())
            .Returns(new DevInn.Domain.Aggregates.Bookings.Abstractions.PricingBreakdown(
                new Money(200m), new Money(0m), 0, new Money(0m), new Money(200m), 2, new Money(400m)));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _bookingRepository.Received(1)
            .AddAsync(Arg.Any<DevInn.Domain.Aggregates.Bookings.Booking>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    private CreateBookingCommand CreateValidCommand(Guid roomId)
    {
        return new CreateBookingCommand(
            Guest: new GuestDto(
                Name: _faker.Name.FirstName(),
                Phone: _faker.Phone.PhoneNumber("###########"),
                Email: _faker.Person.Email,
                Document: "12345678900"),
            RoomId: roomId,
            CheckIn: DateTimeOffset.UtcNow.AddDays(1),
            CheckOut: DateTimeOffset.UtcNow.AddDays(3),
            Adults: 2,
            Children: 0,
            ChildrenAges: []);
    }
}