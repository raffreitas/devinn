using DevInn.Application.Features.Bookings.Commands.DeleteBooking;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class DeleteBookingEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/{Id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var command = new DeleteBookingCommand(id);
                var result = await sender.Send(command, ct);
                return result.ToNoContent();
            }).WithTags(Tags.Bookings)
            .WithName("Delete Booking")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}
