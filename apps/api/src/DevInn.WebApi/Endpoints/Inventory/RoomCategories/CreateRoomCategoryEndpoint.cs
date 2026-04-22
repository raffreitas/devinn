using DevInn.Application.Features.Inventory.Commands.RoomCategories.CreateRoomCategory;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class CreateRoomCategoryEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateRoomCategoryCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated(roomCategoryId => $"{Route}/{roomCategoryId}");
            })
            .WithTags(Tags.RoomCategories)
            .WithName("Create Room Category")
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}
