using DevInn.Application.Features.Auth.Commands.Login;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class LoginEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/login";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (LoginCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Authentication)
            .Produces<ApiResource<LoginResult>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .AllowAnonymous();
    }
}