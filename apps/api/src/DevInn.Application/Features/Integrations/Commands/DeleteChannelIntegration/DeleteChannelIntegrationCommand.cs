using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.DeleteChannelIntegration;

public sealed record DeleteChannelIntegrationCommand(Guid Id) : ICommand<Result>;