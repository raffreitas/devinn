using DevInn.Application.Features.Bookings.Commands.CreateBooking;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class CreateBookingEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateBookingCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated(bookingId => $"{Route}/{bookingId}");
            })
            .WithTags(Tags.Bookings)
            .WithName("Create Booking")
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiProblemDetails>(StatusCodes.Status409Conflict);
    }
}