using System.Net;

using DevInn.Application.Common.Email.Abstractions;
using DevInn.Infrastructure.Email.Options;
using DevInn.Infrastructure.Email.Templates;

using Microsoft.Extensions.Options;

using Resend;

namespace DevInn.Infrastructure.Email.Services;

internal sealed class EmailService(IResend client, IOptions<EmailOptions> options) : IEmailService
{
    private readonly EmailOptions _options = options.Value;

    public async Task SendPasswordResetAsync(PasswordResetEmail message, CancellationToken cancellationToken = default)
    {
        var recipientEmail = WebUtility.HtmlEncode(message.RecipientEmail);
        var recipientName = WebUtility.HtmlEncode(message.RecipientName);
        var resetUrl = WebUtility.HtmlEncode(message.ResetUrl);
        var from = $"{_options.FromName} <{_options.FromAddress}>";

        await client.EmailSendAsync(
            new EmailMessage
            {
                From = from,
                To = recipientEmail,
                Subject = "Redefina sua senha no DevInn",
                HtmlBody = PasswordResetTemplate.Build(recipientName, resetUrl, message.ExpiresInMinutes)
            }, cancellationToken);
    }
}