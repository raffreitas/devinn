using DevInn.Application.Features.Integrations.Commands.SyncChannelIntegration;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class SyncChannelIntegrationEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations/{id:guid}/sync";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var command = new SyncChannelIntegrationCommand(id);
                var result = await sender.Send(command, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Integrations)
            .WithName("Sync Channel Integration")
            .Produces<ApiResource<int>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}