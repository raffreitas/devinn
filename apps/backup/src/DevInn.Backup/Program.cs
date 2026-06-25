using Amazon.Runtime;
using Amazon.S3;
using DevInn.Backup;
using DevInn.Backup.Configuration;
using DevInn.Backup.Jobs;
using DevInn.Backup.Observability;
using DevInn.Backup.Postgres;
using DevInn.Backup.Storage;
using DevInn.Backup.System;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddSimpleConsole(options =>
    {
        options.SingleLine = true;
        options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ ";
        options.UseUtcTimestamp = true;
    });
    builder.SetMinimumLevel(LogLevel.Information);
});

var logger = loggerFactory.CreateLogger("DevInn.Backup");
using var metrics = new BackupMetrics();
MeterProvider? meterProvider = null;

try
{
    var environment = Environment.GetEnvironmentVariables()
        .Cast<System.Collections.DictionaryEntry>()
        .ToDictionary(
            entry => (string)entry.Key,
            entry => entry.Value?.ToString(),
            StringComparer.Ordinal);

    var options = BackupOptions.FromEnvironment(environment);
    if (options.OTelEnabled)
    {
        meterProvider = Sdk.CreateMeterProviderBuilder()
            .AddMeter(BackupMetrics.MeterName)
            .AddOtlpExporter()
            .Build();
    }

    using var amazonS3 = new AmazonS3Client(
        new BasicAWSCredentials(options.S3AccessKeyId, options.S3SecretAccessKey),
        new AmazonS3Config
        {
            ServiceURL = options.S3Endpoint.ToString(),
            AuthenticationRegion = options.S3Region,
            ForcePathStyle = options.S3ForcePathStyle
        });

    var storage = new S3BackupStorage(amazonS3, options);

    var job = new BackupJob(
        options,
        new PostgresDumpService(options, new ProcessRunner()),
        storage,
        loggerFactory.CreateLogger<BackupJob>(),
        metrics);

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
