using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.ExpenseCategories.GetExpenseCategories;

internal sealed class GetExpenseCategoriesHandler(IExpenseCategoryRepository categoryRepository)
    : IQueryHandler<GetExpenseCategoriesQuery, Result<ExpenseCategoryResponse[]>>
{
    public async ValueTask<Result<ExpenseCategoryResponse[]>> Handle(GetExpenseCategoriesQuery query,
        CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.GetAllAsync(cancellationToken);

        var response = categories.Select(c => new ExpenseCategoryResponse(c.Id, c.Name)).ToArray();

        return Result.Ok(response);
    }
}