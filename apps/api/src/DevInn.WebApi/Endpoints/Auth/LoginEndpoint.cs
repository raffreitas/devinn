using DevInn.Application.Features.Auth.Login;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Endpoints.Auth;

public sealed class LoginEndpoint : IEndpoint
{
    private const string Route = "api/v1/auth/login";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (LoginInput input, ILoginUseCase uc, CancellationToken ct) =>
            {
                var result = await uc.ExecuteAsync(input, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Authentication)
            .Produces<ApiResource<LoginOutput>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .AllowAnonymous();
    }
}