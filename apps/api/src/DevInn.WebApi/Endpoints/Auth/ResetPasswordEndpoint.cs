using DevInn.Application.Features.Auth.Commands.ResetPassword;
using DevInn.WebApi.Common;
using DevInn.WebApi.Configuration;

using Mediator;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class ResetPasswordEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/reset-password";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (ResetPasswordCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Authentication)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiProblemDetails>(StatusCodes.Status429TooManyRequests)
            .RequireRateLimiting(RateLimitConfiguration.ResetPasswordPolicyName)
            .AllowAnonymous();
    }
}