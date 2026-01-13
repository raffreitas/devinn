using DevInn.Shared.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Shared.Persistence;

public static class PersistenceSetup
{
    public static void AddPersistenceConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention();
        });
    }
}