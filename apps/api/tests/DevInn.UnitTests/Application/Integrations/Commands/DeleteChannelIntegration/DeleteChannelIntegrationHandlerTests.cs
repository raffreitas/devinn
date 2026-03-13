using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Integrations.Commands.DeleteChannelIntegration;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Enums;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Integrations.Commands.DeleteChannelIntegration;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class DeleteChannelIntegrationHandlerTests
{
    private readonly IChannelIntegrationRepository _integrationRepository = Substitute.For<IChannelIntegrationRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly DeleteChannelIntegrationHandler _sut;

    public DeleteChannelIntegrationHandlerTests()
    {
        _sut = new DeleteChannelIntegrationHandler(_integrationRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenIntegrationDoesNotExist()
    {
        var command = new DeleteChannelIntegrationCommand(Guid.NewGuid());
        _integrationRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Integração não encontrada");
    }

    [Fact]
    public async Task Handle_ShouldRemoveIntegrationAndCommit_WhenIntegrationExists()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var command = new DeleteChannelIntegrationCommand(integration.Id);
        _integrationRepository.GetByIdAsync(command.Id, TestContext.Current.CancellationToken).Returns(integration);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _integrationRepository.Received(1).RemoveAsync(integration, TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}