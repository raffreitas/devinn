using DevInn.Backup.Configuration;
using DevInn.Backup.Jobs;
using DevInn.Backup.Observability;
using DevInn.Backup.Postgres;
using DevInn.Backup.Storage;
using DevInn.Backup.System;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenTelemetry.Metrics;
using OpenTelemetry;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.AddBackupEnvironmentVariables();

builder.Logging.AddSimpleConsole(options =>
{
    options.SingleLine = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ ";
    options.UseUtcTimestamp = true;
});
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddOptions<BackupOptions>()
    .Bind(builder.Configuration.GetSection(BackupOptions.SectionName))
    .ValidateOnStart();
builder.Services.AddSingleton<IValidateOptions<BackupOptions>, BackupOptionsValidator>();

builder.Services.AddSingleton<BackupMetrics>();
builder.Services.AddSingleton<ProcessRunner>();
builder.Services.AddSingleton<IDumpService, PostgresDumpService>();
builder.Services.AddSingleton<IBackupStorage, S3BackupStorage>();
builder.Services.AddSingleton<BackupJob>();
builder.Services.AddSingleton<IAmazonS3>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<BackupOptions>>().Value;

    return new AmazonS3Client(
        new BasicAWSCredentials(options.S3AccessKeyId, options.S3SecretAccessKey),
        new AmazonS3Config
        {
            ServiceURL = options.S3Endpoint!.ToString(),
            AuthenticationRegion = options.S3Region,
            ForcePathStyle = options.S3ForcePathStyle
        });
});

using var app = builder.Build();
var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DevInn.Backup");
MeterProvider? meterProvider = null;

try
{
    var options = app.Services.GetRequiredService<IOptions<BackupOptions>>().Value;
    if (options.OTelEnabled)
    {
        meterProvider = Sdk.CreateMeterProviderBuilder()
            .AddMeter(BackupMetrics.MeterName)
            .AddOtlpExporter()
            .Build();
    }

    var job = app.Services.GetRequiredService<BackupJob>();
    await job.RunAsync(CancellationToken.None);
    return 0;
}
catch (Exception ex)
{
    logger.LogError(ex, "Backup failed");
    return 1;
}
finally
{
    meterProvider?.Dispose();
}
