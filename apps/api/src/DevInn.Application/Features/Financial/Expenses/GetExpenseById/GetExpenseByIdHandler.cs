using DevInn.Application.Common.Errors;
using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.Expenses.GetExpenseById;

internal sealed class GetExpenseByIdHandler(IExpenseRepository expenseRepository)
    : IQueryHandler<GetExpenseByIdQuery, Result<ExpenseDetailResponse>>
{
    public async ValueTask<Result<ExpenseDetailResponse>> Handle(GetExpenseByIdQuery query,
        CancellationToken cancellationToken)
    {
        var expense = await expenseRepository.GetByIdAsync(query.Id, cancellationToken);
        if (expense is null)
            return Result.Fail(new NotFoundError("Despesa não encontrada"));

        var response = new ExpenseDetailResponse(
            expense.Id,
            expense.CategoryId,
            expense.Description,
            expense.Amount,
            expense.DueDate,
            expense.PaymentDate,
            expense.PaymentMethod,
            expense.Status.ToString()
        );

        return Result.Ok(response);
    }
}