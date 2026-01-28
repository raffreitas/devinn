using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.CreateChannelIntegration;

internal sealed class CreateChannelIntegrationHandler(
    IChannelIntegrationRepository integrationRepository,
    IRoomRepository roomRepository,
    IUnitOfWork uow) : ICommandHandler<CreateChannelIntegrationCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateChannelIntegrationCommand command,
        CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        // Verify room exists
        var room = await roomRepository.GetByIdAsync(command.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        // Check if room already has an integration
        var hasExisting =
            await integrationRepository.ExistsByRoomIdAsync(command.RoomId, cancellationToken: cancellationToken);
        if (hasExisting)
            return Result.Fail(new ConflictError("Este quarto já possui uma integração de canal configurada"));

        var integration = new ChannelIntegration(
            command.ChannelType,
            command.ICalUrl,
            command.RoomId);

        await integrationRepository.AddAsync(integration, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(integration.Id);
    }
}