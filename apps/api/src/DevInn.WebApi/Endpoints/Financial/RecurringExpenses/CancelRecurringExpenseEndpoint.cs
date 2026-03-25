using DevInn.Application.Features.Financial.RecurringExpenses.CancelRecurringExpense;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.RecurringExpenses;

public sealed class CancelRecurringExpenseEndpoint : IEndpoint
{
    private const string Route = "api/v1/recurring-expenses/{id:guid}/cancel";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new CancelRecurringExpenseCommand(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Expenses)
            .WithName("Cancel Recurring Expense")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}