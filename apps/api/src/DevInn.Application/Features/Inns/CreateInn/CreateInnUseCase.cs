using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inns.CreateInn;

public interface ICreateInnUseCase : IUseCase<CreateInnInput, Result<Guid>>;

internal sealed class CreateInnUseCase(IInnRepository innRepository, IUnitOfWork uow) : ICreateInnUseCase
{
    public async ValueTask<Result<Guid>> ExecuteAsync(
        CreateInnInput input,
        CancellationToken cancellationToken = default)
    {
        var validationResult = input.Validate();
        if (validationResult.IsFailure)
            return Result.Fail(validationResult.ToError());

        var inn = new Inn(
            input.Name,
            input.Address,
            input.City,
            input.Country,
            input.State,
            input.Phone,
            input.Email
        );

        await innRepository.AddAsync(inn, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result.Ok(inn.Id);
    }
}