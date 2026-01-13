using DevInn.Application.Common.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Tokens;
using DevInn.Application.Common.Tokens.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Auth.Login;

public interface ILoginUseCase : IUseCase<LoginInput, Result<LoginOutput>>;

internal sealed class LoginUseCase(IIdentityService identityService, ITokenService tokenService) : ILoginUseCase
{
    public async ValueTask<Result<LoginOutput>> ExecuteAsync(LoginInput input,
        CancellationToken cancellationToken = default)
    {
        var result = await identityService.LoginAsync(input.Email, input.Password, cancellationToken);
        if (result.IsFailed)
            return Result.Fail(new UnauthorizedError("Credenciais inválidas"));

        var user = result.Value;
        var userRoles = user.Roles.Select(r => r.ToString());

        var tokenRequest = new TokenRequest(user.Id, user.TenantId, userRoles);

        var token = await tokenService.GenerateTokenAsync(tokenRequest, cancellationToken);

        return Result.Ok(new LoginOutput(token.AccessToken));
    }
}