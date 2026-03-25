using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenseById;
using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.RecurringExpenses;

public sealed class GetRecurringExpenseByIdEndpoint : IEndpoint
{
    private const string Route = "api/v1/recurring-expenses/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new GetRecurringExpenseByIdQuery(id), ct);
                return result.ToOk();
            })
            .WithTags(Tags.Expenses)
            .WithName("Get Recurring Expense By Id")
            .Produces<ApiResource<RecurringExpenseResponse>>(StatusCodes.Status200OK)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}