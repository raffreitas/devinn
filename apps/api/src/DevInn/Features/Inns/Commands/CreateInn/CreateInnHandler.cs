using DevInn.Features.Inns.Domain;
using DevInn.Shared.Extensions;
using DevInn.Shared.Persistence;
using DevInn.Shared.Persistence.Context;

using FluentResults;

using Mediator;

namespace DevInn.Features.Inns.Commands.CreateInn;

internal sealed class CreateInHandler(ApplicationDbContext dbContext) : ICommandHandler<CreateInnCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateInnCommand request, CancellationToken cancellationToken)
    {
        var validationResult = request.Validate();
        if (validationResult.HasError) return Result.Fail(validationResult.Errors.ToError());

        var inn = new Inn(
            request.Name,
            request.Address,
            request.City,
            request.Country,
            request.State,
            request.Phone,
            request.Email);

        await dbContext.Inns.AddAsync(inn, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Ok(inn.Id);
    }
}