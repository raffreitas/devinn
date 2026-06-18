namespace DevInn.Application.Common.Email.Abstractions;

public interface IEmailGateway
{
    Task SendPasswordResetAsync(PasswordResetEmail message, CancellationToken cancellationToken = default);
}

public sealed record PasswordResetEmail(
    string RecipientEmail,
    string RecipientName,
    string ResetUrl,
    int ExpiresInMinutes);
