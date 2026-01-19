using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Commands.CreateInn;

internal sealed class CreateInnHandler(IInnRepository innRepository, IUnitOfWork uow)
    : ICommandHandler<CreateInnCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateInnCommand command, CancellationToken cancellationToken)
    {
        var validationResult = command.Validate();
        if (validationResult.IsFailure)
            return Result.Fail(validationResult.ToError());

        var inn = new Inn(
            command.Name,
            command.Address,
            command.City,
            command.Country,
            command.State,
            command.Phone,
            command.Email
        );

        await innRepository.AddAsync(inn, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result.Ok(inn.Id);
    }
}