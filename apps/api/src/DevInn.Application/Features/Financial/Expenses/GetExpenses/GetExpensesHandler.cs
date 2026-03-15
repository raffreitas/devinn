using System.Data;

using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Pagination;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Common.Time;
using DevInn.Domain.Aggregates.Financial.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenses;

internal sealed class GetExpensesHandler(
    IDbConnectionFactory dbConnectionFactory,
    ITenantContext tenantContext,
    IDateTimeProvider dateTimeProvider
) : IQueryHandler<GetExpensesQuery, Result<PaginatedResult<ExpenseResponse>>>
{
    public async ValueTask<Result<PaginatedResult<ExpenseResponse>>> Handle(GetExpensesQuery query,
        CancellationToken cancellationToken)
    {
        var today = dateTimeProvider.GetLocalDate();

        const string countSql = """
                                SELECT count(1)
                                FROM expenses e
                                WHERE e.inn_id = @TenantId
                                    AND (@CategoryId IS NULL OR e.category_id = @CategoryId)
                                    AND (@PaymentMethod IS NULL OR e.payment_method = @PaymentMethod)
                                    AND (@Status IS NULL OR e.status = @Status)
                                    AND (@DueDateFrom IS NULL OR e.due_date >= @DueDateFrom)
                                    AND (@DueDateTo IS NULL OR e.due_date <= @DueDateTo)
                                """;

        const string sql = $"""
                            SELECT
                                e.id             AS "{nameof(ExpenseResponse.Id)}",
                                e.category_id    AS "{nameof(ExpenseResponse.CategoryId)}",
                                e.description    AS "{nameof(ExpenseResponse.Description)}",
                                e.amount         AS "{nameof(ExpenseResponse.Amount)}",
                                e.due_date       AS "{nameof(ExpenseResponse.DueDate)}",
                                e.payment_date   AS "{nameof(ExpenseResponse.PaymentDate)}",
                                e.payment_method AS "{nameof(ExpenseResponse.PaymentMethod)}",
                                e.status         AS "{nameof(ExpenseResponse.Status)}",
                                ec.name          AS "{nameof(ExpenseResponse.CategoryName)}"
                            FROM expenses e
                            INNER JOIN expense_categories ec ON e.category_id = ec.id
                            WHERE e.inn_id = @TenantId
                                AND (@CategoryId IS NULL OR e.category_id = @CategoryId)
                                AND (@PaymentMethod IS NULL OR e.payment_method = @PaymentMethod)
                                AND (@Status IS NULL OR e.status = @Status)
                                AND (@DueDateFrom IS NULL OR e.due_date >= @DueDateFrom)
                                AND (@DueDateTo IS NULL OR e.due_date <= @DueDateTo)
                            ORDER BY e.due_date DESC
                            OFFSET @Offset
                            LIMIT @PageSize;
                            """;

        var parameters = new DynamicParameters();
        parameters.Add("@TenantId", tenantContext.Tenant.Id, DbType.Guid);
        parameters.Add("@CategoryId", query.CategoryId, DbType.Guid);
        parameters.Add("@PaymentMethod", query.PaymentMethod?.ToString(), DbType.AnsiString);
        parameters.Add("@Status", query.Status, DbType.AnsiString);
        parameters.Add("@DueDateFrom", query.DueDateFrom, DbType.Date);
        parameters.Add("@DueDateTo", query.DueDateTo, DbType.Date);
        parameters.Add("@PageSize", query.PageSize, DbType.Int32);
        parameters.Add("@Offset", query.Offset, DbType.Int32);

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var count = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var rawExpenses = await connection.QueryAsync<RawExpense>(sql, parameters);

        var expenses = rawExpenses.Select(re =>
        {
            var displayStatus = re.Status switch
            {
                nameof(ExpenseStatus.Paid) => ExpenseDisplayStatus.Paid,
                nameof(ExpenseStatus.Cancelled) => ExpenseDisplayStatus.Cancelled,
                nameof(ExpenseStatus.Pending) when re.DueDate < today => ExpenseDisplayStatus.Overdue,
                nameof(ExpenseStatus.Pending) when re.DueDate == today => ExpenseDisplayStatus.DueToday,
                _ => ExpenseDisplayStatus.Pending
            };

            return new ExpenseResponse(
                re.Id,
                re.CategoryId,
                re.Description,
                re.Amount,
                re.DueDate,
                re.PaymentDate,
                re.PaymentMethod,
                displayStatus,
                re.CategoryName
            );
        }).ToList();


        var paged = new PaginatedResult<ExpenseResponse>([.. expenses], count, query.PageNumber, query.PageSize);
        return Result.Ok(paged);
    }
}