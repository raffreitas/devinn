using DevInn.Application.Features.Inventory.RoomCategories.UpdateRoomCategory;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class UpdateRoomCategoryEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route,
                async (Guid id, UpdateRoomCategoryCommand command, ISender sender, CancellationToken ct) =>
                {
                    var inputWithId = command with { Id = id };
                    var result = await sender.Send(inputWithId, ct);
                    return result.ToNoContent();
                })
            .WithTags(Tags.RoomCategories)
            .WithName("Update Room Category")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity);
    }
}