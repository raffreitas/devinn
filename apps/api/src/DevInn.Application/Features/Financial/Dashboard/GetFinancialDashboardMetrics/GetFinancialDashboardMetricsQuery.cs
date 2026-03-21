using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Dashboard.GetFinancialDashboardMetrics;

public sealed record GetFinancialDashboardMetricsQuery(
    DateOnly? ReferenceDate = null
) : IQuery<Result<FinancialDashboardMetricsResponse>>;