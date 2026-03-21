using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Commands.UpdateInn;

internal sealed class UpdateInnHandler(
    IInnRepository innRepository,
    ITenantContext tenantContext,
    IUnitOfWork uow) : ICommandHandler<UpdateInnCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateInnCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        if (command.Id != tenantContext.Tenant.Id)
            return Result.Fail(new NotFoundError("Pousada não encontrada."));

        var inn = await innRepository.GetByIdAsync(command.Id, cancellationToken);
        if (inn is null)
            return Result.Fail(new NotFoundError("Pousada não encontrada."));

        inn.Update(
            command.Name,
            command.Address,
            command.City,
            command.Country,
            command.State,
            command.ZipCode,
            command.Phone,
            command.Email);

        await innRepository.UpdateAsync(inn, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
