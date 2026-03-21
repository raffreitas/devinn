using DevInn.Application.Features.Auth.Commands.UpdateProfile;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class UpdateProfileEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/me";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (UpdateProfileCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Authentication)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}
