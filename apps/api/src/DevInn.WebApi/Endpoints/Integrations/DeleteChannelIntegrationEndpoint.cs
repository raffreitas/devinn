using DevInn.Application.Features.Integrations.Commands.DeleteChannelIntegration;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class DeleteChannelIntegrationEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var command = new DeleteChannelIntegrationCommand(id);
                var result = await sender.Send(command, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Integrations)
            .WithName("Delete Channel Integration")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}