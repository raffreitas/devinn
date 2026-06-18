using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.UpdateProfile;

internal sealed class UpdateProfileHandler(
    IIdentityGateway identityService,
    IUserContext userContext
) : ICommandHandler<UpdateProfileCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var userResult = await identityService.GetUserByIdAsync(userContext.UserId, cancellationToken);
        if (userResult.IsFailed)
            return Result.Fail(userResult.Errors);

        var updatedUser = userResult.Value with { Name = command.Name };

        var updateProfileResult = await identityService.UpdateProfileAsync(updatedUser, cancellationToken);
        return updateProfileResult.IsFailed
            ? Result.Fail(updateProfileResult.Errors)
            : Result.Ok();
    }
}