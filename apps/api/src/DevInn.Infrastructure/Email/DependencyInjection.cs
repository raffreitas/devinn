using DevInn.Application.Common.Email.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Email.Options;
using DevInn.Infrastructure.Email.Services;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Resend;

namespace DevInn.Infrastructure.Email;

internal static class DependencyInjection
{
    public static IServiceCollection ConfigureEmail(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<EmailOptions>()
            .BindConfiguration(EmailOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var emailOptions = configuration.GetOrThrow<EmailOptions>(EmailOptions.SectionName);

        services.AddHttpClient<ResendClient>();
        services.Configure<ResendClientOptions>(o =>
        {
            o.ApiToken = emailOptions.ApiKey;
        });
        services.AddTransient<IResend, ResendClient>();
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}