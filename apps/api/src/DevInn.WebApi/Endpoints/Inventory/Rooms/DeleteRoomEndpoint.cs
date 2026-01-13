using DevInn.Application.Features.Inventory.Rooms.DeleteRoom;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class DeleteRoomEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms/{id}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, IDeleteRoomUseCase uc, CancellationToken ct) =>
            {
                var result = await uc.ExecuteAsync(new DeleteRoomInput(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Rooms)
            .WithName("Delete Room")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound);
    }
}
