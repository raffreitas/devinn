using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Inventory.Rooms.CreateRoom;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.Aggregates.Inventory;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Inventory.Rooms.CreateRoom;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateRoomHandlerTests
{
    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IRoomCategoryRepository _categoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateRoomHandler _sut;

    public CreateRoomHandlerTests()
    {
        _sut = new CreateRoomHandler(_roomRepository, _categoryRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        var command = new CreateRoomCommand(Guid.NewGuid(), 101, "Suite", RoomStatus.Active);
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Categoria não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenRoomNumberIsNotUnique()
    {
        var category = new RoomCategory("Suite", "Desc", 4, new PricingPolicy(200m, 50m));
        var command = new CreateRoomCommand(category.Id, 101, "Suite 101", RoomStatus.Active);
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).Returns(category);
        _roomRepository.IsNumberUniqueAsync(command.Number, null, TestContext.Current.CancellationToken).Returns(false);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
    }

    [Fact]
    public async Task Handle_ShouldCreateRoomAndCommit_WhenCommandIsValid()
    {
        var category = new RoomCategory("Suite", "Desc", 4, new PricingPolicy(200m, 50m));
        var command = new CreateRoomCommand(category.Id, 101, "Suite 101", RoomStatus.Active);
        _categoryRepository.GetByIdAsync(command.CategoryId, TestContext.Current.CancellationToken).Returns(category);
        _roomRepository.IsNumberUniqueAsync(command.Number, null, TestContext.Current.CancellationToken).Returns(true);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _roomRepository.Received(1).AddAsync(Arg.Any<Room>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}
