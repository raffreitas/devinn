using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Tokens;
using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Login;

internal sealed class LoginHandler(IIdentityService identityService, ITokenService tokenService)
    : ICommandHandler<LoginCommand, Result<LoginResult>>
{
    public async ValueTask<Result<LoginResult>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());
        var result = await identityService.LoginAsync(command.Email, command.Password, cancellationToken);
        if (result.IsFailed)
            return Result.Fail(new UnauthorizedError("Credenciais inválidas"));

        var user = result.Value;
        var userRoles = user.Roles.Select(r => r.ToString());

        var tokenRequest = new TokenRequest(user.Id, user.TenantId, userRoles);

        var token = await tokenService.GenerateTokenAsync(tokenRequest, cancellationToken);

        return Result.Ok(new LoginResult(token.AccessToken));
    }
}