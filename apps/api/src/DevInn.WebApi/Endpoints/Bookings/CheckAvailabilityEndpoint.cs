using DevInn.Application.Features.Bookings.Queries.CheckAvailability;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class CheckAvailabilityEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/availability";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] CheckAvailabilityQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Bookings)
            .WithName("Check Availability")
            .Produces<ApiResource<CheckAvailabilityResponse>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}