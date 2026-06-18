using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.ForgotPassword;

internal sealed class ForgotPasswordHandler(IIdentityGateway identityService)
    : ICommandHandler<ForgotPasswordCommand, Result>
{
    public async ValueTask<Result> Handle(ForgotPasswordCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var request = new ForgotPasswordRequest(command.Email);

        var result = await identityService.RequestPasswordResetAsync(request, cancellationToken);
        return result.IsFailed
            ? Result.Fail(result.Errors)
            : Result.Ok();
    }
}