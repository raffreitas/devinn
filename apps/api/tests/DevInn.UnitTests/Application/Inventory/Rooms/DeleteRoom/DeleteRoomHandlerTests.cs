using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Inventory.Commands.Rooms.DeleteRoom;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Inventory.Rooms.DeleteRoom;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class DeleteRoomHandlerTests
{
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly DeleteRoomHandler _sut;

    public DeleteRoomHandlerTests()
    {
        _sut = new DeleteRoomHandler(_bookingRepository, _roomRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenIdIsEmpty()
    {
        var result = await _sut.Handle(new DeleteRoomCommand(Guid.Empty), TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenRoomDoesNotExist()
    {
        var command = new DeleteRoomCommand(Guid.NewGuid());
        _roomRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Quarto não encontrado");
    }

    [Fact]
    public async Task Handle_ShouldDeleteRoomAndCommit_WhenRoomExists()
    {
        var room = new Room(Guid.NewGuid(), 301);
        var command = new DeleteRoomCommand(room.Id);
        _roomRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(room);
        _bookingRepository.HasLinkedRoomBookingsAsync(room.Id, TestContext.Current.CancellationToken).Returns(false);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _roomRepository.Received(1).DeleteAsync(room, TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenRoomHasLinkedBookings()
    {
        var room = new Room(Guid.NewGuid(), 302);
        var command = new DeleteRoomCommand(room.Id);
        _roomRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(room);
        _bookingRepository.HasLinkedRoomBookingsAsync(room.Id, TestContext.Current.CancellationToken).Returns(true);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
        result.Errors[0].Message.ShouldBe("Não é possível excluir o quarto porque existem reservas vinculadas.");
        await _roomRepository.DidNotReceive().DeleteAsync(Arg.Any<Room>(), TestContext.Current.CancellationToken);
        await _uow.DidNotReceive().CommitAsync(TestContext.Current.CancellationToken);
    }
}
