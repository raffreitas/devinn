using DevInn.Application.Features.Financial.ExpenseCategories.GetExpenseCategories;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.ExpenseCategories;

public sealed class GetExpenseCategoriesEndpoint : IEndpoint
{
    private const string Route = "api/v1/expense-categories";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new GetExpenseCategoriesQuery(), ct);
                return result.ToOk();
            })
            .WithTags(Tags.ExpenseCategories)
            .WithName("List Expense Categories")
            .Produces<ApiResource<ExpenseCategoryResponse[]>>(StatusCodes.Status200OK)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }
}