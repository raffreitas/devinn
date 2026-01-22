using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Aggregates.Financial.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.ExpenseCategories.CreateExpenseCategory;

internal sealed class CreateExpenseCategoryHandler(
    IExpenseCategoryRepository categoryRepository,
    IUnitOfWork uow
) : ICommandHandler<CreateExpenseCategoryCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateExpenseCategoryCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var existing = await categoryRepository.GetByNameAsync(command.Name, cancellationToken);
        if (existing != null)
            return Result.Fail(new ConflictError("Uma categoria com este nome já existe para esta pousada"));

        var category = new ExpenseCategory(command.Name);
        await categoryRepository.AddAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(category.Id);
    }
}