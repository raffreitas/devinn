using DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class CalculatePriceBreakdownEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/price-breakdown";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route,
                async ([AsParameters] CalculatePriceBreakdownQuery query, ISender sender, CancellationToken ct) =>
                {
                    var result = await sender.Send(query, ct);
                    return result.ToOk();
                })
            .WithTags(Tags.Bookings)
            .WithName("Calculate Price Breakdown")
            .WithDescription(
                "Calcula o breakdown de preços para uma reserva baseado no período, categoria de quarto e ocupação")
            .Produces<ApiResource<PriceBreakdownDto>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}
