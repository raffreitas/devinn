using DevInn.Application.Features.Integrations.Queries.GetChannelIntegrationById;
using DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class GetChannelIntegrationByIdEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var query = new GetChannelIntegrationByIdQuery(id);
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Integrations)
            .WithName("Get Channel Integration By Id")
            .Produces<ApiResource<ChannelIntegrationDto>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}