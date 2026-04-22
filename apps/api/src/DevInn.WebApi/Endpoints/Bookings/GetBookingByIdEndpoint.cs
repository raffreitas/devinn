using DevInn.Application.Features.Bookings.Queries.GetBookingById;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class GetBookingByIdEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/{Id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var query = new GetBookingByIdQuery(id);
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Bookings)
            .WithName("Get Booking By Id")
            .Produces<ApiResource<BookingDto>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}
