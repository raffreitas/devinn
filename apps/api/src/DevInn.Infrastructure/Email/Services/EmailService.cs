using System.Net;

using DevInn.Application.Common.Email.Abstractions;
using DevInn.Infrastructure.Email.Options;

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
                HtmlBody = BuildPasswordResetTemplate(recipientName, resetUrl, message.ExpiresInMinutes)
            }, cancellationToken);
    }

    private static string BuildPasswordResetTemplate(string recipientName, string resetUrl, int expiresInMinutes)
    {
        return $"""
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Redefinir senha</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                    Recebemos uma solicitação para redefinir sua senha no DevInn.
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fb;padding:24px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
                          <tr>
                            <td style="padding:40px 40px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
                              <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.88;">DevInn</div>
                              <h1 style="margin:16px 0 8px;font-size:30px;line-height:1.2;font-weight:700;">Redefinição de senha</h1>
                              <p style="margin:0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.9);">
                                Proteja o acesso da sua pousada com um fluxo seguro e rápido.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Olá, {recipientName}!</p>
                              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
                                Recebemos uma solicitação para redefinir sua senha no <strong>DevInn</strong>. Para continuar, clique no botão abaixo.
                              </p>

                              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                                <tr>
                                  <td align="center" style="border-radius:14px;background:#2563eb;">
                                    <a href="{resetUrl}" style="display:inline-block;padding:15px 28px;font-size:16px;font-weight:600;line-height:1;text-decoration:none;color:#ffffff;">
                                      Redefinir minha senha
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <div style="margin:0 0 24px;padding:18px 20px;border:1px solid #dbeafe;border-radius:18px;background:#eff6ff;">
                                <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1d4ed8;">Importante</p>
                                <p style="margin:0;font-size:14px;line-height:1.7;color:#1e3a8a;">
                                  Este link expira em <strong>{expiresInMinutes} minutos</strong> e deve ser usado apenas uma vez.
                                </p>
                              </div>

                              <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
                                Se o botão não funcionar, copie e cole este link no navegador:
                              </p>
                              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;word-break:break-all;color:#2563eb;">
                                {resetUrl}
                              </p>

                              <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
                                Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha atual continuará válida até que a redefinição seja concluída.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:24px 40px 40px;border-top:1px solid #e2e8f0;">
                              <p style="margin:0;font-size:12px;line-height:1.7;color:#94a3b8;">
                                Este é um e-mail transacional enviado automaticamente pelo DevInn.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
    }
}