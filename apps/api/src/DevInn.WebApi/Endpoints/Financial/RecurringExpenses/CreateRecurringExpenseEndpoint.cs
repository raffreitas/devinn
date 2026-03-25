using DevInn.Application.Features.Financial.RecurringExpenses.CreateRecurringExpense;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.RecurringExpenses;

public sealed class CreateRecurringExpenseEndpoint : IEndpoint
{
    private const string Route = "api/v1/recurring-expenses";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateRecurringExpenseCommand command, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(command, ct);
                return result.ToCreated(id => $"{Route}/{id}");
            })
            .WithTags(Tags.Expenses)
            .WithName("Create Recurring Expense")
            .Produces<ApiResource<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}