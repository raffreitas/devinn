using System.Text;

using DevInn.Application.Common.Email.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Infrastructure.Identity.Models;
using DevInn.Infrastructure.Identity.Options;

using FluentResults;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DevInn.Infrastructure.Identity.Services;

internal sealed class IdentityService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    IEmailService emailService,
    IOptions<PasswordResetOptions> passwordResetOptions,
    ILogger<IdentityService> logger)
    : IIdentityService
{
    private readonly PasswordResetOptions _passwordResetOptions = passwordResetOptions.Value;

    public async Task<Result<User>> LoginAsync(string email, string password,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !await userManager.CheckPasswordAsync(user, password))
            return Result.Fail(new UnauthorizedError("Invalid credentials"));

        var roles = await userManager.GetRolesAsync(user);
        var userRoles = roles.Select(Enum.Parse<UserRole>).ToArray();
        var resultUser = new User(user.Id, user.InnId, user.Name, user.Email!, userRoles, user.SecurityStamp ?? string.Empty);

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

        var resultUser = new User(
            newUser.Id,
            newUser.InnId,
            newUser.Name,
            newUser.Email!,
            [request.Role],
            newUser.SecurityStamp ?? string.Empty);

        return Result.Ok(resultUser);
    }

    public async Task<Result<User>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return Result.Fail(new NotFoundError("Usuário não encontrado"));

        var roles = await userManager.GetRolesAsync(user);
        var userRoles = roles.Select(Enum.Parse<UserRole>).ToArray();
        var resultUser = new User(user.Id, user.InnId, user.Name, user.Email!, userRoles, user.SecurityStamp ?? string.Empty);

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

    public async Task<Result> RequestPasswordResetAsync(ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            logger.LogInformation("Solicitação de recuperação de senha recebida para uma conta inexistente.");
            return Result.Ok();
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var resetUrl = BuildPasswordResetUrl(user.Id, encodedToken);

        await emailService.SendPasswordResetAsync(
            new PasswordResetEmail(
                user.Email!,
                user.Name,
                resetUrl,
                _passwordResetOptions.TokenLifetimeInMinutes),
            cancellationToken);

        logger.LogInformation("Email de recuperação de senha enviado para o usuário {UserId}.", user.Id);

        return Result.Ok();
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
            return Result.Fail(new ValidationError("O link de redefinição é inválido ou expirou."));

        var decodedToken = DecodeResetToken(request.Token);
        if (decodedToken.IsFailed)
            return Result.Fail(decodedToken.Errors);

        var resetResult = await userManager.ResetPasswordAsync(user, decodedToken.Value, request.NewPassword);
        if (!resetResult.Succeeded)
        {
            if (resetResult.Errors.Any(error => error.Code == "InvalidToken"))
                return Result.Fail(new ValidationError("O link de redefinição é inválido ou expirou."));

            var errors = resetResult.Errors.Select(e => e.Description);
            logger.LogError("Erro ao redefinir senha do usuário {UserId}: {Errors}", user.Id, errors);
            return Result.Fail("Falha ao redefinir senha.");
        }

        var stampResult = await userManager.UpdateSecurityStampAsync(user);
        if (!stampResult.Succeeded)
        {
            var errors = stampResult.Errors.Select(e => e.Description);
            logger.LogError("Erro ao invalidar sessões do usuário {UserId}: {Errors}", user.Id, errors);
            return Result.Fail("Falha ao invalidar sessões ativas após redefinir a senha.");
        }

        logger.LogInformation("Senha redefinida com sucesso para o usuário {UserId}.", user.Id);
        return Result.Ok();
    }

    private string BuildPasswordResetUrl(Guid userId, string encodedToken)
    {
        var baseUrl = _passwordResetOptions.FrontendBaseUrl.TrimEnd('/');
        return $"{baseUrl}/reset-password?userId={userId:D}&token={encodedToken}";
    }

    private static Result<string> DecodeResetToken(string token)
    {
        try
        {
            var bytes = WebEncoders.Base64UrlDecode(token);
            return Result.Ok(Encoding.UTF8.GetString(bytes));
        }
        catch (FormatException)
        {
            return Result.Fail(new ValidationError("O link de redefinição é inválido ou expirou."));
        }
        catch (ArgumentException)
        {
            return Result.Fail(new ValidationError("O link de redefinição é inválido ou expirou."));
        }
    }
}
