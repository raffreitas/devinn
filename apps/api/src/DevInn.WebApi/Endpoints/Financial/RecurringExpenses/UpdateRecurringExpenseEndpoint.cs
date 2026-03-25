using DevInn.Application.Features.Financial.RecurringExpenses.UpdateRecurringExpense;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.RecurringExpenses;

public sealed class UpdateRecurringExpenseEndpoint : IEndpoint
{
    private const string Route = "api/v1/recurring-expenses/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(Route, async (Guid id, UpdateRecurringExpenseCommand command, ISender sender, CancellationToken ct) =>
            {
                var inputWithId = command with { Id = id };
                var result = await sender.Send(inputWithId, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Expenses)
            .WithName("Update Recurring Expense")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}