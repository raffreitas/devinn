using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;

public sealed record SyncChannelIntegrationCommand(Guid IntegrationId) : ICommand<Result<int>>;