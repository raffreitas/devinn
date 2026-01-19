using DevInn.Application.Features.Inns.Queries.GetInnById;
using DevInn.Application.Features.Inns.Shared.DTOs;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inns;

public sealed class GetInnByIdEndpoint : IEndpoint
{
    private const string Route = "api/v1/inns/{Id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var query = new GetInnByIdQuery(id);
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Inns)
            .WithName("Get Inn By Id")
            .Produces<ApiResource<InnDto>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}