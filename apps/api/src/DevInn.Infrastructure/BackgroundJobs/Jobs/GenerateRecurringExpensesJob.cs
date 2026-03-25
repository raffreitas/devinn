using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;

using Mediator;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs.Jobs;

[DisallowConcurrentExecution]
internal sealed class GenerateRecurringExpensesJob(
    IDbConnectionFactory dbConnectionFactory,
    ILogger<GenerateRecurringExpensesJob> logger,
    IServiceScopeFactory serviceScopeFactory
) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("Starting GenerateRecurringExpensesJob execution");

        // Intentional cross-tenant query: this background job is a system-level process
        // responsible for processing recurring expenses across ALL tenants. The tenant context
        // is set per-item inside the foreach loop before dispatching the command.
        // Do NOT add a tenant filter here.
        const string query = """
                             SELECT id AS "Id", inn_id AS "InnId"
                             FROM recurring_expenses
                             WHERE status = 'Active'
                             """;

        await using var dbConnection = await dbConnectionFactory.OpenConnectionAsync(context.CancellationToken);
        var recurringExpenses = await dbConnection.QueryAsync<RecurringExpenseRow>(query, context.CancellationToken);

        foreach (var recurringExpense in recurringExpenses)
        {
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var tenantContext = scope.ServiceProvider.GetRequiredService<ITenantContext>();
                var sender = scope.ServiceProvider.GetRequiredService<ISender>();

                tenantContext.SetTenant(new Tenant(recurringExpense.InnId));
                await sender.Send(new ProcessRecurringExpenseCommand(recurringExpense.Id), context.CancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error generating recurring expense {RecurringExpenseId}", recurringExpense.Id);
            }
        }

        logger.LogInformation("GenerateRecurringExpensesJob execution completed");
    }

    private sealed record RecurringExpenseRow(Guid Id, Guid InnId);
}