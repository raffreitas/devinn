using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.UpdateChannelIntegration;

internal sealed class UpdateChannelIntegrationHandler(
    IChannelIntegrationRepository integrationRepository,
    IRoomRepository roomRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateChannelIntegrationCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateChannelIntegrationCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var integration = await integrationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (integration is null)
            return Result.Fail(new NotFoundError("Integração não encontrada"));

        // Verify room exists
        var room = await roomRepository.GetByIdAsync(command.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        var hasExisting =
            await integrationRepository.ExistsByRoomIdAndChannelTypeAsync(
                command.RoomId,
                integration.ChannelType,
                command.Id,
                cancellationToken);
        if (hasExisting)
            return Result.Fail(new ConflictError("Este quarto já possui outra integração configurada para este canal"));

        integration.UpdateICalUrl(command.ICalUrl);
        integration.UpdateRoomId(command.RoomId);

        if (command.IsActive)
            integration.Activate();
        else
            integration.Deactivate();

        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
