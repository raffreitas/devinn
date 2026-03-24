namespace DevInn.Application.Common.Email.Abstractions;

public interface IEmailService
{
    Task SendPasswordResetAsync(PasswordResetEmail message, CancellationToken cancellationToken = default);
}

public sealed record PasswordResetEmail(
    string RecipientEmail,
    string RecipientName,
    string ResetUrl,
    int ExpiresInMinutes);