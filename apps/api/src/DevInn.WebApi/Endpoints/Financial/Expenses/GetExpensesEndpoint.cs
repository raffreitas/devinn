using DevInn.Application.Features.Financial.Expenses.GetExpenses;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.Expenses;

public sealed class GetExpensesEndpoint : IEndpoint
{
    private const string Route = "api/v1/expenses";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async ([AsParameters] GetExpensesQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Expenses)
            .WithName("List Expenses")
            .Produces<ApiResource<ExpenseResponse[]>>(StatusCodes.Status200OK)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}