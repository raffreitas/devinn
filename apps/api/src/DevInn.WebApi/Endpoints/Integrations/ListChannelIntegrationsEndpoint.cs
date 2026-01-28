using DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class ListChannelIntegrationsEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route,
                async ([AsParameters] ListChannelIntegrationsQuery query, ISender sender, CancellationToken ct) =>
                {
                    var result = await sender.Send(query, ct);
                    return result.ToOk();
                })
            .WithTags(Tags.Integrations)
            .WithName("List Channel Integrations")
            .Produces<ApiResource<ChannelIntegrationDto[]>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}