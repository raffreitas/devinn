using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Infrastructure.Identity.Models;

using FluentResults;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DevInn.Infrastructure.Identity.Services;

internal sealed class IdentityService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ILogger<IdentityService> logger)
    : IIdentityService
{
    public async Task<Result<User>> LoginAsync(string email, string password,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !await userManager.CheckPasswordAsync(user, password))
            return Result.Fail(new UnauthorizedError("Invalid credentials"));

        var roles = await userManager.GetRolesAsync(user);
        var userRoles = roles.Select(Enum.Parse<UserRole>).ToArray();
        var resultUser = new User(user.Id, user.InnId, user.UserName!, user.Email!, userRoles);

        return Result.Ok(resultUser);
    }

    public async Task<Result<User>> RegisterAsync(RegisterUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var userExists = await userManager.FindByEmailAsync(request.Email);
        if (userExists is not null)
            return Result.Fail(new ConflictError("Email já está em uso"));

        var newUser = new ApplicationUser(request.Name, request.Email, request.InnId);

        var createUserResult = await userManager.CreateAsync(newUser, request.Password);
        if (!createUserResult.Succeeded)
        {
            logger.LogError("Erro ao criar usuário: {Errors}",
                string.Join(", ", createUserResult.Errors.Select(e => e.Description)));
            return Result.Fail("Falha ao criar usuário");
        }

        var roleExists = await roleManager.RoleExistsAsync(request.Role.ToString());
        if (!roleExists)
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>(request.Role.ToString()));
            if (!roleResult.Succeeded)
            {
                logger.LogError("Erro ao criar função de usuário: {Errors}",
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                return Result.Fail("Falha ao criar função de usuário");
            }
        }

        var assignRoleResult = await userManager.AddToRoleAsync(newUser, request.Role.ToString());
        if (!assignRoleResult.Succeeded)
        {
            logger.LogError("Erro ao atribuir função ao usuário: {Errors}",
                string.Join(", ", assignRoleResult.Errors.Select(e => e.Description)));
            return Result.Fail("Falha ao atribuir função ao usuário");
        }

        var resultUser = new User(newUser.Id, newUser.InnId, newUser.UserName!, newUser.Email!, [request.Role]);

        return Result.Ok(resultUser);
    }

    public async Task<Result<User>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return Result.Fail(new NotFoundError("Usuário não encontrado"));

        var roles = await userManager.GetRolesAsync(user);
        var userRoles = roles.Select(Enum.Parse<UserRole>).ToArray();
        var resultUser = new User(user.Id, user.InnId, user.Name, user.Email!, userRoles);

        return Result.Ok(resultUser);
    }

    public async Task<Result> UpdateProfileAsync(User user, CancellationToken cancellationToken = default)
    {
        var existingUser = await userManager.FindByIdAsync(user.Id.ToString());
        if (existingUser is null)
            return Result.Fail(new NotFoundError("Usuário não encontrado"));

        existingUser.Name = user.Name;

        var updateResult = await userManager.UpdateAsync(existingUser);
        if (updateResult.Succeeded)
            return Result.Ok();

        var erros = updateResult.Errors.Select(e => e.Description);
        logger.LogError("Erro ao atualizar perfil do usuário: {Errors}", erros);
        return Result.Fail("Falha ao atualizar o perfil.");
    }

    public async Task<Result> ChangePasswordAsync(ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
            return Result.Fail(new NotFoundError("Usuário não encontrado"));

        var changeResult = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (changeResult.Succeeded)
            return Result.Ok();

        var errors = changeResult.Errors.Select(e => e.Description);
        logger.LogError("Erro ao alterar senha do usuário: {Errors}", errors);
        return Result.Fail("Falha ao alterar senha.");
    }
}
