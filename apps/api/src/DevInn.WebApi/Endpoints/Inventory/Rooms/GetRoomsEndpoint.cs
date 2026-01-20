using DevInn.Application.Features.Inventory.Rooms.GetRooms;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class GetRoomsEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] GetRoomsQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Rooms)
            .WithName("List Rooms")
            .Produces<ApiResource<List<RoomResponse[]>>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .RequireAuthorization();
    }
}