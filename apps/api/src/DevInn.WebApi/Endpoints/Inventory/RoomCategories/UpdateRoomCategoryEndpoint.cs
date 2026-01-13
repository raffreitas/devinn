using DevInn.Application.Features.Inventory.RoomCategories.UpdateRoomCategory;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Endpoints.Inventory.RoomCategories;

public sealed class UpdateRoomCategoryEndpoint : IEndpoint
{
    private const string Route = "api/v1/room-categories/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route,
                async (Guid id, UpdateRoomCategoryInput input, IUpdateRoomCategoryUseCase uc, CancellationToken ct) =>
                {
                    var inputWithId = input with { Id = id };
                    var result = await uc.ExecuteAsync(inputWithId, ct);
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