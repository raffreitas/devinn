using DevInn.Application.Features.Auth.Login;
using DevInn.Application.Features.Auth.Queries.GetProfile;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class ProfileEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/me";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (ISender sender, CancellationToken ct) =>
            {
                var query = new GetProfileQuery();
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Authentication)
            .Produces<ApiResource<GetProfileResponse>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();
    }
}