using DevInn.Application.Features.Inventory.Commands.Rooms.DeleteRoom;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class DeleteRoomEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms/{id}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new DeleteRoomCommand(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Rooms)
            .WithName("Delete Room")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}
