using DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class DeleteRoomCategoryEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new DeleteRoomCategoryCommand(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.RoomCategories)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status409Conflict);
    }
}