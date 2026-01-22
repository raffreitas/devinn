using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenses;

internal sealed class GetExpensesHandler(IExpenseRepository expenseRepository)
    : IQueryHandler<GetExpensesQuery, Result<ExpenseResponse[]>>
{
    public async ValueTask<Result<ExpenseResponse[]>> Handle(GetExpensesQuery query,
        CancellationToken cancellationToken)
    {
        var expenses = await expenseRepository.GetAllAsync(cancellationToken);

        var response = expenses.Select(e => new ExpenseResponse(
            e.Id,
            e.CategoryId,
            e.Description,
            e.Amount,
            e.DueDate,
            e.PaymentDate,
            e.PaymentMethod,
            e.Status.ToString()
        )).ToArray();

        return Result.Ok(response);
    }
}