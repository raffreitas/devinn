using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Tokens;
using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.Login;

internal sealed class LoginHandler(
    IIdentityGateway identityGateway,
    IAccessTokenProvider accessTokenProvider,
    TimeProvider timeProvider)
    : ICommandHandler<LoginCommand, Result<LoginResult>>
{
    public async ValueTask<Result<LoginResult>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());
        var result = await identityGateway.LoginAsync(command.Email, command.Password, cancellationToken);
        if (result.IsFailed)
            return Result.Fail(new UnauthorizedError("Credenciais inválidas"));

        var user = result.Value;
        var userRoles = user.Roles.Select(r => r.ToString());

        var tokenRequest = new TokenRequest(user.Id, user.TenantId, userRoles, user.Email, user.SecurityStamp);

        var token = await accessTokenProvider.GenerateTokenAsync(tokenRequest, cancellationToken);
        await identityGateway.RecordSuccessfulLoginAsync(user.Id, timeProvider.GetUtcNow(), cancellationToken);

        return Result.Ok(new LoginResult(token.AccessToken));
    }
}