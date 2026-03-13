using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Integrations.Commands.CreateChannelIntegration;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Integrations.Commands.CreateChannelIntegration;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateChannelIntegrationHandlerTests
{
    private readonly IChannelIntegrationRepository _integrationRepository = Substitute.For<IChannelIntegrationRepository>();
    private readonly IRoomRepository _roomRepository = Substitute.For<IRoomRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateChannelIntegrationHandler _sut;

    public CreateChannelIntegrationHandlerTests()
    {
        _sut = new CreateChannelIntegrationHandler(_integrationRepository, _roomRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenRoomDoesNotExist()
    {
        var command = new CreateChannelIntegrationCommand(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Quarto não encontrado");
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenRoomAlreadyHasIntegration()
    {
        var room = new Room(Guid.NewGuid(), 201);
        var command = new CreateChannelIntegrationCommand(ChannelType.Booking, "https://example.com/feed.ics", room.Id);
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _integrationRepository.ExistsByRoomIdAsync(room.Id, null, TestContext.Current.CancellationToken).Returns(true);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
    }

    [Fact]
    public async Task Handle_ShouldCreateIntegrationAndCommit_WhenCommandIsValid()
    {
        var room = new Room(Guid.NewGuid(), 201);
        var command = new CreateChannelIntegrationCommand(ChannelType.Airbnb, "https://example.com/feed.ics", room.Id);
        _roomRepository.GetByIdAsync(command.RoomId, TestContext.Current.CancellationToken).Returns(room);
        _integrationRepository.ExistsByRoomIdAsync(room.Id, null, TestContext.Current.CancellationToken).Returns(false);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _integrationRepository.Received(1).AddAsync(Arg.Any<ChannelIntegration>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}