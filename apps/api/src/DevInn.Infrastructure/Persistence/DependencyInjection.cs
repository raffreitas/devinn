using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Financial.Abstractions;
using DevInn.Domain.Aggregates.Inns.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Infrastructure.BackgroundJobs.Options;
using DevInn.Infrastructure.Common.Constants;
using DevInn.Infrastructure.Common.Extensions;
using DevInn.Infrastructure.Integrations;
using DevInn.Infrastructure.Integrations.Gateways;
using DevInn.Infrastructure.Persistence.Context;
using DevInn.Infrastructure.Persistence.Factories;
using DevInn.Infrastructure.Persistence.Interceptors;
using DevInn.Infrastructure.Persistence.Repositories;
using DevInn.Infrastructure.Persistence.SeedData;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Npgsql;

namespace DevInn.Infrastructure.Persistence;

public static class DependencyInjection
{
    internal static IServiceCollection ConfigurePersistence(this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionStringOrThrow("DatabaseConnection");

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var tenantContext = sp.GetRequiredService<ITenantContext>();
            var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
            options.UseNpgsql(
                    connectionString,
                    sqlOptions => sqlOptions.EnableRetryOnFailure())
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(
                    new AuditLogInterceptor(tenantContext, httpContextAccessor),
                    new TenantInterceptors(tenantContext));
        });

        services.AddSingleton(new NpgsqlDataSourceBuilder(connectionString).Build());
        services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IInnRepository, InnRepository>();
        services.AddScoped<IRoomCategoryRepository, RoomCategoryRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IExpenseCategoryRepository, ExpenseCategoryRepository>();
        services.AddScoped<IChannelIntegrationRepository, ChannelIntegrationRepository>();

        var jobsOptions = configuration
            .GetSection(BackgroundJobsOptions.SectionName)
            .Get<BackgroundJobsOptions>() ?? new BackgroundJobsOptions();

        // External Services
        services.AddHttpClient(HttpICalFeedGateway.HttpClientName, client =>
        {
            client.Timeout = TimeSpan.FromSeconds(jobsOptions.ICalHttpTimeoutSeconds);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("DevInn/1.0 iCalSync");
        });
        services.AddScoped<IICalFeedGateway, HttpICalFeedGateway>();
        services.AddScoped<IICalExportService, ICalExportService>();

        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == EnvironmentNames.Development)
        {
            services.AddTransient<DatabaseSeed>();
        }

        return services;
    }
}
