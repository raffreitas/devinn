using System.Text;

using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Tokens.Options;
using DevInn.Infrastructure.Tokens.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace DevInn.Infrastructure.Tokens;

public static class DependencyInjection
{
    internal static IServiceCollection ConfigureTokenService(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<JwtTokenOptions>()
            .BindConfiguration(JwtTokenOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var jwtOptions = configuration.GetOrThrow<JwtTokenOptions>(JwtTokenOptions.SectionName);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidAlgorithms = [JwtTokenService.JwtAlgorithm],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtOptions.SecretKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddScoped<ITokenService, JwtTokenService>();

        return services;
    }
}