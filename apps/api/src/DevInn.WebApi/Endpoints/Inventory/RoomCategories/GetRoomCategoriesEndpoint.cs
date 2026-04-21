using DevInn.Application.Features.Inventory.Queries.RoomCategories.GetRoomCategories;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class GetRoomCategoriesEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new GetRoomCategoriesQuery(), ct);
                return result.ToOk();
            })
            .WithTags(Tags.RoomCategories)
            .WithName("List Room Categories")
            .Produces<ApiResource<RoomCategoryResponse[]>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .RequireAuthorization();
    }
}
