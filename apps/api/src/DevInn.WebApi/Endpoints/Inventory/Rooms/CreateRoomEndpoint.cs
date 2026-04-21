using DevInn.Application.Features.Inventory.Commands.Rooms.CreateRoom;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class CreateRoomEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateRoomCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated(roomId => $"{Route}/{roomId}");
            })
            .WithTags(Tags.Rooms)
            .WithName("Create Room")
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}
