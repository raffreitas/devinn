using DevInn.Application.Features.Inns.Commands.UpdateInn;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inns;

public sealed class UpdateInnEndpoint : IEndpoint
{
    private const string Route = "api/v1/inns/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (Guid id, UpdateInnCommand command, ISender sender, CancellationToken ct) =>
            {
                var inputWithId = command with { Id = id };
                var result = await sender.Send(inputWithId, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Inns)
            .WithName("Update Inn")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}
