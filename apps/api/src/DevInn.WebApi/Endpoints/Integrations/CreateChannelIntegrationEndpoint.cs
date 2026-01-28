using DevInn.Application.Features.Integrations.Commands.CreateChannelIntegration;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class CreateChannelIntegrationEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateChannelIntegrationCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated(integrationId => $"{Route}/{integrationId}");
            })
            .WithTags(Tags.Integrations)
            .WithName("Create Channel Integration")
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}