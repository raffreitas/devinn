using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Time;
using DevInn.Application.Common.Tenancy.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Dashboard.GetFinancialDashboardMetrics;

internal sealed class GetFinancialDashboardMetricsHandler(
    IDbConnectionFactory dbConnectionFactory,
    ITenantContext tenantContext,
    IDateTimeProvider dateTimeProvider
) : IQueryHandler<GetFinancialDashboardMetricsQuery, Result<FinancialDashboardMetricsResponse>>
{
    public async ValueTask<Result<FinancialDashboardMetricsResponse>> Handle(
        GetFinancialDashboardMetricsQuery query,
        CancellationToken cancellationToken)
    {
        var referenceDate = query.ReferenceDate ?? dateTimeProvider.GetLocalDate();
        var referenceMonthStart = new DateOnly(referenceDate.Year, referenceDate.Month, 1);
        var windowStart = referenceMonthStart.AddMonths(-11);
        var referenceMonthStartDateTime = referenceMonthStart.ToDateTime(TimeOnly.MinValue);
        var windowStartDateTime = windowStart.ToDateTime(TimeOnly.MinValue);

        const string sql = """
                           WITH paid_amounts AS (
                               SELECT booking_id, COALESCE(SUM(amount), 0) AS total
                               FROM payments
                               GROUP BY booking_id
                           ),
                           months AS (
                               SELECT generate_series(@WindowStart::date, @ReferenceMonthStart::date, interval '1 month')::date AS month_start
                           ),
                           booking_totals AS (
                               SELECT
                                   m.month_start,
                                   COALESCE(SUM(b.total_value), 0) AS total_revenue,
                                   COALESCE(SUM(COALESCE(pa.total, 0)), 0) AS received_revenue
                               FROM months m
                               LEFT JOIN bookings b
                                   ON b.inn_id = @TenantId
                                  AND b.check_out > m.month_start
                                  AND b.check_in < (m.month_start + interval '1 month')
                               LEFT JOIN paid_amounts pa ON pa.booking_id = b.id
                               GROUP BY m.month_start
                           ),
                           expense_totals AS (
                               SELECT
                                   m.month_start,
                                   COALESCE(SUM(e.amount), 0) AS total_expenses
                               FROM months m
                               LEFT JOIN expenses e
                                   ON e.inn_id = @TenantId
                                  AND e.due_date >= m.month_start
                                  AND e.due_date < (m.month_start + interval '1 month')
                               GROUP BY m.month_start
                           )
                           SELECT
                               m.month_start::timestamp AS "MonthStart",
                               COALESCE(bt.total_revenue, 0)    AS "TotalRevenue",
                               COALESCE(bt.received_revenue, 0) AS "ReceivedRevenue",
                               COALESCE(et.total_expenses, 0)   AS "TotalExpenses"
                           FROM months m
                           LEFT JOIN booking_totals bt ON bt.month_start = m.month_start
                           LEFT JOIN expense_totals et ON et.month_start = m.month_start
                           ORDER BY m.month_start;
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = (await connection.QueryAsync<RawDashboardMonth>(sql, new
        {
            TenantId = tenantContext.Tenant.Id,
            WindowStart = windowStartDateTime,
            ReferenceMonthStart = referenceMonthStartDateTime
        })).ToArray();

        var monthlyEvolution = rows.Select(row =>
        {
            var monthStart = DateOnly.FromDateTime(row.MonthStart);
            var pendingRevenue = row.TotalRevenue - row.ReceivedRevenue;
            var actualBalance = row.ReceivedRevenue - row.TotalExpenses;
            var projectedBalance = row.TotalRevenue - row.TotalExpenses;

            return new FinancialDashboardMonthResponse(
                monthStart,
                row.TotalRevenue,
                row.ReceivedRevenue,
                pendingRevenue,
                row.TotalExpenses,
                actualBalance,
                projectedBalance);
        }).ToArray();

        var currentMonth = monthlyEvolution.LastOrDefault()
            ?? new FinancialDashboardMonthResponse(referenceMonthStart, 0m, 0m, 0m, 0m, 0m, 0m);

        return Result.Ok(new FinancialDashboardMetricsResponse(
            referenceMonthStart,
            currentMonth.TotalRevenue,
            currentMonth.ReceivedRevenue,
            currentMonth.PendingRevenue,
            currentMonth.TotalExpenses,
            currentMonth.ActualBalance,
            currentMonth.ProjectedBalance,
            monthlyEvolution));
    }

    private sealed class RawDashboardMonth
    {
        public DateTime MonthStart { get; init; }
        public decimal TotalRevenue { get; init; }
        public decimal ReceivedRevenue { get; init; }
        public decimal TotalExpenses { get; init; }
    }
}