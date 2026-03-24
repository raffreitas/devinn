namespace DevInn.Infrastructure.Email.Templates;

internal static class PasswordResetTemplate
{
    public static string Build(string recipientName, string resetUrl, int expiresInMinutes)
    {
        return $"""
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Redefinir senha — DevInn</title>
                  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
                </head>
                <body style="margin:0;padding:0;background-color:#f8faf7;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
                  <!-- Preheader (hidden inbox preview text) -->
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f8faf7;">
                    Você solicitou a redefinição da sua senha no DevInn. Este link expira em {expiresInMinutes} minutos.
                    &#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8faf7;">
                    <tr>
                      <td align="center" style="padding:40px 16px;">

                        <!-- Main card -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

                          <!-- Header -->
                          <tr>
                            <td style="padding:36px 40px 28px;border-bottom:1px solid #e2e8f0;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                                <td style="vertical-align:middle;padding-right:12px;">
                                  <div style="width:36px;height:36px;border-radius:10px;background:#4d8b2f;text-align:center;line-height:36px;">
                                    <span style="color:#ffffff;font-size:16px;font-weight:700;">D</span>
                                  </div>
                                </td>
                                <td style="vertical-align:middle;">
                                  <span style="font-size:18px;font-weight:600;color:#0f172a;letter-spacing:-0.02em;">DevInn</span>
                                </td>
                              </tr></table>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px;">
                              <!-- Icon -->
                              <div style="margin-bottom:28px;">
                                <div style="width:52px;height:52px;border-radius:14px;background:#f0fbe8;text-align:center;line-height:52px;">
                                  <!--[if mso]><span style="font-size:24px;">&#128274;</span><![endif]-->
                                  <!--[if !mso]><!-- -->
                                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234d8b2f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10'/%3E%3Cpath d='m9 12 2 2 4-4'/%3E%3C/svg%3E" alt="" width="24" height="24" style="vertical-align:middle;" />
                                  <!--<![endif]-->
                                </div>
                              </div>

                              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;line-height:1.3;color:#0f172a;letter-spacing:-0.02em;">
                                Redefinição de senha
                              </h1>
                              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#64748b;">
                                Olá, {recipientName}. Recebemos uma solicitação para redefinir a senha da sua conta no DevInn.
                              </p>

                              <!-- CTA Button -->
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
                                <tr>
                                  <td align="center">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                      <tr>
                                        <td style="border-radius:10px;background:#4d8b2f;">
                                          <a href="{resetUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;line-height:1;text-decoration:none;color:#ffffff;letter-spacing:-0.01em;">
                                            Redefinir minha senha
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>

                              <!-- Info box -->
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
                                <tr>
                                  <td style="padding:16px 20px;border-radius:12px;background:#f8faf7;border:1px solid #dce8d4;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                                      <td style="vertical-align:top;padding-right:12px;padding-top:1px;">
                                        <div style="width:8px;height:8px;border-radius:50%;background:#4d8b2f;margin-top:5px;"></div>
                                      </td>
                                      <td>
                                        <p style="margin:0;font-size:13px;line-height:1.7;color:#3d6b25;">
                                          Este link é válido por <strong>{expiresInMinutes} minutos</strong> e pode ser usado apenas uma vez.
                                        </p>
                                      </td>
                                    </tr></table>
                                  </td>
                                </tr>
                              </table>

                              <!-- Fallback URL -->
                              <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#94a3b8;">
                                Se o botão não funcionar, copie e cole este link:
                              </p>
                              <p style="margin:0 0 28px;font-size:13px;line-height:1.6;word-break:break-all;color:#4d8b2f;">
                                {resetUrl}
                              </p>

                              <!-- Divider -->
                              <div style="height:1px;background:#e2e8f0;margin-bottom:24px;"></div>

                              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                                Se você não solicitou esta alteração, ignore este e-mail. Sua senha atual permanece ativa.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding:20px 40px 28px;border-top:1px solid #e2e8f0;">
                              <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                                Enviado automaticamente pelo <span style="color:#64748b;">DevInn</span>. Você recebeu este e-mail por ter uma conta ativa.
                              </p>
                            </td>
                          </tr>

                        </table>
                        <!-- /Main card -->

                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
    }
}