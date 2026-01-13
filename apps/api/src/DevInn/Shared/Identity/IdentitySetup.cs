using DevInn.Shared.Identity.Constants;
using DevInn.Shared.Identity.Models;
using DevInn.Shared.Identity.Services;
using DevInn.Shared.Persistence.Context;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace DevInn.Shared.Identity;

public static class IdentitySetup
{
    public static void AddIdentityConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure Identity
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // Configure password policy
        services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.Lockout.AllowedForNewUsers = true;
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
        });

        // Configure JWT
        var jwtSection = configuration.GetSection("Jwt");
        var secretKey = jwtSection["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSection["Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
        var audience = jwtSection["Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

        var key = System.Text.Encoding.ASCII.GetBytes(secretKey);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(Roles.SuperAdmin, policy => policy.RequireRole(Roles.SuperAdmin))
            .AddPolicy(Roles.InnAdmin, policy => policy.RequireRole(Roles.InnAdmin, Roles.SuperAdmin));

        services.AddScoped<IJwtTokenService, JwtTokenService>();
    }
}