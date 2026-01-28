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

        // Check if another integration already uses this room
        if (integration.RoomId != command.RoomId)
        {
            var hasExisting =
                await integrationRepository.ExistsByRoomIdAsync(command.RoomId, command.Id, cancellationToken);
            if (hasExisting)
                return Result.Fail(new ConflictError("Este quarto já possui outra integração de canal configurada"));
        }

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