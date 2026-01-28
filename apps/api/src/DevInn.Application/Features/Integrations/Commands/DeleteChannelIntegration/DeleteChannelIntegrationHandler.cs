using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Domain.Aggregates.Integrations.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.DeleteChannelIntegration;

internal sealed class DeleteChannelIntegrationHandler(
    IChannelIntegrationRepository integrationRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteChannelIntegrationCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteChannelIntegrationCommand command, CancellationToken cancellationToken)
    {
        var integration = await integrationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (integration is null)
            return Result.Fail(new NotFoundError("Integração não encontrada"));

        await integrationRepository.RemoveAsync(integration, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}