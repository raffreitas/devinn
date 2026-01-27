using DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Queries.GetChannelIntegrationById;

public record GetChannelIntegrationByIdQuery(Guid Id) : IQuery<Result<ChannelIntegrationDto>>;