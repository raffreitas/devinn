namespace DevInn.Application.Features.Financial.Dashboard.GetFinancialDashboardMetrics;

public sealed record FinancialDashboardMonthResponse(
    DateOnly MonthStart,
    decimal TotalRevenue,
    decimal ReceivedRevenue,
    decimal PendingRevenue,
    decimal TotalExpenses,
    decimal ActualBalance,
    decimal ProjectedBalance);

public sealed record FinancialDashboardMetricsResponse(
    DateOnly ReferenceMonth,
    decimal TotalRevenue,
    decimal ReceivedRevenue,
    decimal PendingRevenue,
    decimal TotalExpenses,
    decimal ActualBalance,
    decimal ProjectedBalance,
    FinancialDashboardMonthResponse[] MonthlyEvolution);