using DevInn.Application.Features.Financial.Expenses.DeleteExpense;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Financial.Expenses;

public sealed class DeleteExpenseEndpoint : IEndpoint
{
    private const string Route = "api/v1/expenses/{id:guid}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(Route, async (Guid id, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new DeleteExpenseCommand(id), ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Expenses)
            .WithName("Delete Expense")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }
}