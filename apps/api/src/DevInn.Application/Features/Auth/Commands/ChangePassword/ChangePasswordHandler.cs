using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.ChangePassword;

internal sealed class ChangePasswordHandler(IIdentityGateway identityService, IUserContext userContext)
    : ICommandHandler<ChangePasswordCommand, Result>
{
    public async ValueTask<Result> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var request = new ChangePasswordRequest(
            userContext.UserId,
            command.CurrentPassword,
            command.NewPassword
        );

        var changePasswordResult = await identityService.ChangePasswordAsync(request, cancellationToken);
        return changePasswordResult.IsFailed
            ? Result.Fail(changePasswordResult.Errors)
            : Result.Ok();
    }
}