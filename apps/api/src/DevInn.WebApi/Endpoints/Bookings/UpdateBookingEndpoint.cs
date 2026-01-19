using DevInn.Application.Features.Bookings.Commands.UpdateBooking;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class UpdateBookingEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (Guid id, UpdateBookingCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command with { Id = id }, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Bookings)
            .WithName("Update Booking")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiProblemDetails>(StatusCodes.Status409Conflict)
            .RequireAuthorization();
    }
}