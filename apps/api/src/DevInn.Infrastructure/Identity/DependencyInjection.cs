using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Identity.Context;
using DevInn.Infrastructure.Identity.Models;
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
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.Lockout.AllowedForNewUsers = true;
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
        });

        // Configure Auth
        services.AddAuthorizationBuilder()
            .AddPolicy(Roles.SuperAdmin, policy => policy.RequireRole(Roles.SuperAdmin))
            .AddPolicy(Roles.InnAdmin, policy => policy.RequireRole(Roles.InnAdmin, Roles.SuperAdmin));

        // Add Services
        services.AddScoped<IIdentityService, IdentityService>();
    }
}