using DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class DeleteRoomCategoryEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, IDeleteRoomCategoryUseCase uc, CancellationToken ct) =>
            {
                var result = await uc.ExecuteAsync(new DeleteRoomCategoryInput(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.RoomCategories)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status409Conflict);
    }
}