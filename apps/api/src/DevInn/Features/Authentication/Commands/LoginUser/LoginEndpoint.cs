using DevInn.Shared.Extensions;
using DevInn.Shared.Web.Models;

using Mediator;

namespace DevInn.Features.Authentication.Commands.LoginUser;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(this IEndpointRouteBuilder app, RouteGroupBuilder? groupBuilder = null)
    {
        app.MapPost("", async (LoginCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated($"api/inns/{result.Value}");
            })
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);
    }
}