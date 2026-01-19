using DevInn.Application.Features.Bookings.Queries.ListBookings;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class ListBookingsEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] ListBookingsQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Bookings)
            .WithName("List Bookings")
            .Produces<ApiResource<List<DevInn.Application.Features.Bookings.Shared.BookingDto[]>>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest);
    }
}