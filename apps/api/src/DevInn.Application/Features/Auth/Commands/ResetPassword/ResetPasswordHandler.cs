using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.ResetPassword;

internal sealed class ResetPasswordHandler(IIdentityGateway identityService)
    : ICommandHandler<ResetPasswordCommand, Result>
{
    public async ValueTask<Result> Handle(ResetPasswordCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var request = new ResetPasswordRequest(command.UserId, command.Token, command.NewPassword);

        var result = await identityService.ResetPasswordAsync(request, cancellationToken);
        return result.IsFailed
            ? Result.Fail(result.Errors)
            : Result.Ok();
    }
}