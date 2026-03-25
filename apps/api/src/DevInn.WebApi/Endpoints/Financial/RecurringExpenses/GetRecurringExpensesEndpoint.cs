using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.RecurringExpenses;

public sealed class GetRecurringExpensesEndpoint : IEndpoint
{
    private const string Route = "api/v1/recurring-expenses";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] GetRecurringExpensesQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Expenses)
            .WithName("List Recurring Expenses")
            .Produces<ApiResource<RecurringExpenseResponse[]>>(StatusCodes.Status200OK)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}