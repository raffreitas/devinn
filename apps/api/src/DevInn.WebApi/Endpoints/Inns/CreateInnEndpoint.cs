using DevInn.Application.Features.Inns.Commands.CreateInn;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inns;

public sealed class CreateInnEndpoint : IEndpoint
{
    private const string Route = "api/v1/inns";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateInnCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated($"{Route}/{result.Value}");
            })
            .WithTags(Tags.Inns)
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity);
    }
}