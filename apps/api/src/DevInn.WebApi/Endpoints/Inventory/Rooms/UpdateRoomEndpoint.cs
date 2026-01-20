using DevInn.Application.Features.Inventory.Rooms.UpdateRoom;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class UpdateRoomEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (Guid id, UpdateRoomCommand command, ISender sender, CancellationToken ct) =>
            {
                var inputWithId = command with { Id = id };
                var result = await sender.Send(inputWithId, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Rooms)
            .WithName("Update Room")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}