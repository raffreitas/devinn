using DevInn.Application.Features.Financial.Dashboard.GetFinancialDashboardMetrics;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.Dashboard;

public sealed class GetFinancialDashboardMetricsEndpoint : IEndpoint
{
    private const string Route = "api/v1/financial/dashboard";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] GetFinancialDashboardMetricsQuery query, ISender sender,
                CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Financial)
            .WithName("Get Financial Dashboard Metrics")
            .Produces<ApiResource<FinancialDashboardMetricsResponse>>(StatusCodes.Status200OK)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}