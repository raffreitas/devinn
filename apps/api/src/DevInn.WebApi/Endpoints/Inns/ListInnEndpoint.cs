using DevInn.Application.Common.Identity;
using DevInn.Application.Features.Inns.Queries.ListInn;
using DevInn.Application.Features.Inns.Shared.DTOs;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inns;

public sealed class ListInnEndpoint : IEndpoint
{
    private const string Route = "api/v1/inns";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] ListInnQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Inns)
            .WithName("List Inns")
            .Produces<ApiResource<List<InnDto[]>>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .RequireAuthorization(Policies.SuperAdminOnly);
    }
}