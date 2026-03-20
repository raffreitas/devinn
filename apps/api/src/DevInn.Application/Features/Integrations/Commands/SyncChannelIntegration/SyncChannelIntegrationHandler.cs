using DevInn.Application.Features.Integrations.Services;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;

internal sealed class SyncChannelIntegrationHandler(IICalSyncService syncService)
    : ICommandHandler<SyncChannelIntegrationCommand, Result<int>>
{
    public async ValueTask<Result<int>> Handle(SyncChannelIntegrationCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            var importedCount = await syncService.SyncChannelIntegrationAsync(command.IntegrationId, cancellationToken);
            return Result.Ok(importedCount);
        }
        catch (Exception ex)
        {
            if (ex is OperationCanceledException) throw;
            return Result.Fail($"Erro ao sincronizar: {ex.Message}");
        }
    }
}