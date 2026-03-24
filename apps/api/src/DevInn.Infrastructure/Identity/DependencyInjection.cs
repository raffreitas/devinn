using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Identity.Models;
using DevInn.Infrastructure.Identity.Options;
using DevInn.Infrastructure.Identity.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Infrastructure.Identity;

public static class DependencyInjection
{
    public static void ConfigureIdentityService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<PasswordResetOptions>()
            .BindConfiguration(PasswordResetOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var passwordResetOptions = configuration.GetOrThrow<PasswordResetOptions>(PasswordResetOptions.SectionName);

        // Configure Identity
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<IdentityDbContext>()
            .AddDefaultTokenProviders();

        services.AddDbContext<IdentityDbContext>(options =>
        {
            options.UseNpgsql(
                    configuration.GetConnectionStringOrThrow("DatabaseConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention();
        });

        // Configure password policy
        services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.Lockout.AllowedForNewUsers = true;
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
        });

        services.Configure<DataProtectionTokenProviderOptions>(options =>
        {
            options.TokenLifespan = TimeSpan.FromMinutes(passwordResetOptions.TokenLifetimeInMinutes);
        });

        // Configure Auth
        services.AddAuthorizationBuilder()
            .AddPolicy(
                name: Policies.SuperAdminOnly,
                configurePolicy: policy => policy.RequireRole(Policies.GetRolesForPolicy(Policies.SuperAdminOnly)))
            .AddPolicy(
                name: Policies.InnAdminOnly,
                configurePolicy: policy => policy.RequireRole(Policies.GetRolesForPolicy(Policies.InnAdminOnly)))
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());

        // Configure HTTP Context Accessor
        services.AddHttpContextAccessor();

        // Add Services
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IUserContext, UserContextService>();
    }
}