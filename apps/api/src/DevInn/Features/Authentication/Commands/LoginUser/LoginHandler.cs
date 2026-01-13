using DevInn.Shared.Extensions;
using DevInn.Shared.Identity.Models;
using DevInn.Shared.Identity.Services;
using DevInn.Shared.Messaging.Errors;
using DevInn.Shared.Persistence.Context;

using FluentResults;

using Mediator;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DevInn.Features.Authentication.Commands.LoginUser;

public sealed class LoginHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenService jwtTokenService,
    ApplicationDbContext dbContext
)
    : ICommandHandler<LoginCommand, Result<LoginResult>>
{
    public async ValueTask<Result<LoginResult>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var validationResult = command.Validate();
        if (validationResult.HasError) return Result.Fail(validationResult.Errors.ToError());

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == command.Email, cancellationToken);
        if (user is null)
            return Result.Fail(new UnauthorizedError("Credenciais inválidas"));

        var identityUser = await userManager.FindByEmailAsync(command.Email);
        if (identityUser is null || !await userManager.CheckPasswordAsync(identityUser, command.Password))
            return Result.Fail(new UnauthorizedError("Credenciais inválidas"));

        var accessToken = jwtTokenService.GenerateAccessToken(user);

        await userManager.ResetAccessFailedCountAsync(identityUser);
        await userManager.UpdateAsync(identityUser);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Ok(new LoginResult(accessToken));
    }
}