using DevInn.Application.Features.Inventory.Rooms.UpdateRoom;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Endpoints.Inventory.Rooms;

public sealed class UpdateRoomEndpoint : IEndpoint
{
    private const string Route = "api/v1/rooms/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (Guid id, UpdateRoomInput input, IUpdateRoomUseCase uc, CancellationToken ct) =>
            {
                var inputWithId = input with { Id = id };
                var result = await uc.ExecuteAsync(inputWithId, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Rooms)
            .WithName("Update Room")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity);
    }
}