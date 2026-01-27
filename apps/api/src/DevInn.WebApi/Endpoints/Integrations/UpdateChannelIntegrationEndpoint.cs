using DevInn.Application.Features.Integrations.Commands.UpdateChannelIntegration;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class UpdateChannelIntegrationEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route,
                async (Guid id, UpdateChannelIntegrationCommand command, ISender sender, CancellationToken ct) =>
                {
                    if (id != command.Id)
                    {
                        return Results.BadRequest(new ApiProblemDetails
                        {
                            Status = StatusCodes.Status400BadRequest,
                            Title = "Invalid Request",
                            Detail = "Route ID does not match command ID"
                        });
                    }

                    var result = await sender.Send(command, ct);
                    return result.ToNoContent();
                })
            .WithTags(Tags.Integrations)
            .WithName("Update Channel Integration")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}