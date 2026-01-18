using DevInn.Application.Common.Identity;
using DevInn.Application.Features.Auth.Register;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class RegisterEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/register";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (RegisterCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated();
            })
            .WithTags(Tags.Authentication)
            .Produces(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization(Policies.SuperAdminOnly);
    }
}