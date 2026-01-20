using Bogus;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Features.Bookings.Commands.CreateBooking;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Bookings.Commands.CreateBooking;

public sealed class CreateBookingHandlerTests
{
    private readonly Faker _faker = new();

    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IRoomCategoryRepository _categoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateBookingHandler _sut;

    public CreateBookingHandlerTests()
    {
        _sut = new CreateBookingHandler(_roomRepository, _categoryRepository, _bookingRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenRoomDoesNotExist()
    {
        // Arrange
        var command = new CreateBookingCommand(
            Guest: new GuestDto(_faker.Name.FirstName(), _faker.Person.Phone, _faker.Person.Email, "12345678900"),
            RoomId: Guid.NewGuid(),
            CheckIn: DateTimeOffset.UtcNow,
            CheckOut: DateTimeOffset.UtcNow.AddDays(5),
            Adults: _faker.Random.Int(min: 1),
            Children: 0,
            ChildrenAges: []
        );

        _roomRepository.GetByIdAsync(command.RoomId).ReturnsNull();
        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailed.ShouldBeTrue();
        result.Errors[0].Message.ShouldBe("Quarto não encontrado");
    }
}