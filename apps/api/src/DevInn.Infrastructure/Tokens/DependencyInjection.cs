using System.Security.Claims;
using System.Text;

using DevInn.Infrastructure.Common.Constants;
using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Identity.Models;
using DevInn.Infrastructure.Tokens.Options;
using DevInn.Infrastructure.Tokens.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
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
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                        var securityStamp = principal?.FindFirstValue(AuthClaimTypes.SecurityStamp);

                        if (!Guid.TryParse(userId, out var parsedUserId) || string.IsNullOrWhiteSpace(securityStamp))
                        {
                            context.Fail("Invalid token claims.");
                            return;
                        }

                        var userManager = context.HttpContext.RequestServices
                            .GetRequiredService<UserManager<ApplicationUser>>();

                        var user = await userManager.FindByIdAsync(parsedUserId.ToString());
                        if (user is null || !string.Equals(user.SecurityStamp, securityStamp, StringComparison.Ordinal))
                            context.Fail("Token has been revoked.");
                    }
                };
            });

        services.AddScoped<ITokenService, JwtTokenService>();

        return services;
    }
}