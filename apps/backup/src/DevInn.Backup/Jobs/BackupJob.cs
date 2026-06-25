using System.Diagnostics;
using DevInn.Backup.Configuration;
using DevInn.Backup.Files;
using DevInn.Backup.Manifests;
using DevInn.Backup.Observability;
using DevInn.Backup.Postgres;
using DevInn.Backup.Retention;
using DevInn.Backup.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DevInn.Backup.Jobs;

internal sealed class BackupJob(
    IOptions<BackupOptions> options,
    IDumpService dumpService,
    IBackupStorage storage,
    ILogger<BackupJob> logger,
    BackupMetrics metrics)
{
    private readonly BackupOptions _options = options.Value;

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var startedAt = DateTimeOffset.UtcNow;
        var stopwatch = Stopwatch.StartNew();
        var fileName = BackupName.GenerateFileName(startedAt);
        var key = BackupName.GenerateKey(_options.S3Prefix, startedAt);
        var manifestKey = BackupName.GenerateManifestKey(_options.S3Prefix, startedAt);
        var tempDirectory = Path.Combine(_options.WorkingDirectory, "devinn-backups", Guid.NewGuid().ToString("N"));
        var dumpPath = Path.Combine(tempDirectory, fileName);

        logger.LogInformation("Backup started. ObjectKey={ObjectKey}", key);

        try
        {
            Directory.CreateDirectory(tempDirectory);

            var connection = PostgresConnectionSettings.Parse(_options.DatabaseUrl);
            await dumpService.CreateDumpAsync(connection, dumpPath, cancellationToken);
            await dumpService.ValidateDumpAsync(dumpPath, cancellationToken);

            var dumpSize = new FileInfo(dumpPath).Length;
            var checksum = await FileChecksumProvider.ComputeSha256Async(dumpPath, cancellationToken);
            logger.LogInformation("Backup dump validated. ObjectKey={ObjectKey} SizeBytes={SizeBytes}", key, dumpSize);

            await storage.UploadAsync(key, dumpPath, cancellationToken);
            logger.LogInformation("Backup uploaded. ObjectKey={ObjectKey} SizeBytes={SizeBytes}", key, dumpSize);

            var deleted = await ApplyRetentionAsync(cancellationToken);

            stopwatch.Stop();
            var completedAt = DateTimeOffset.UtcNow;
            var manifest = new BackupManifest(
                Version: 1,
                ApplicationName: "devinn",
                BucketName: _options.S3Bucket,
                DumpObjectKey: key,
                ManifestObjectKey: manifestKey,
                StartedAtUtc: startedAt,
                CompletedAtUtc: completedAt,
                DurationSeconds: stopwatch.Elapsed.TotalSeconds,
                SizeBytes: dumpSize,
                Sha256Checksum: checksum,
                RetentionDaily: _options.RetentionDaily,
                RetentionWeekly: _options.RetentionWeekly,
                RetentionMonthly: _options.RetentionMonthly,
                DeletedExpiredCount: deleted);

            await storage.UploadJsonAsync(manifestKey, manifest, cancellationToken);
            logger.LogInformation("Backup manifest uploaded. ObjectKey={ObjectKey}", manifestKey);

            metrics.RecordSuccess(stopwatch.Elapsed, dumpSize, deleted);
            logger.LogInformation(
                "Backup completed. ObjectKey={ObjectKey} ManifestKey={ManifestKey} DurationMs={DurationMs} SizeBytes={SizeBytes} DeletedExpiredCount={DeletedExpiredCount}",
                key,
                manifestKey,
                stopwatch.ElapsedMilliseconds,
                dumpSize,
                deleted);
        }
        catch
        {
            metrics.RecordFailure();
            throw;
        }
        finally
        {
            TryDeleteTemporaryDirectory(tempDirectory);
        }
    }

    private async Task<int> ApplyRetentionAsync(CancellationToken cancellationToken)
    {
        var objects = await storage.ListAsync(_options.S3Prefix, cancellationToken);
        var backups = objects
            .Select(obj => new BackupObject(obj.Key, obj.LastModified, obj.SizeBytes))
            .ToArray();

        var expired = new RetentionPolicy(
                _options.RetentionDaily,
                _options.RetentionWeekly,
                _options.RetentionMonthly)
            .SelectExpiredBackups(_options.S3Prefix, backups);

        foreach (var backup in expired)
        {
            await storage.DeleteAsync(backup.Key, cancellationToken);
            logger.LogInformation("Expired backup deleted. ObjectKey={ObjectKey}", backup.Key);
        }

        return expired.Count;
    }

    private static void TryDeleteTemporaryDirectory(string path)
    {
        try
        {
            if (Directory.Exists(path))
                Directory.Delete(path, recursive: true);
        }
        catch
        {
            // Best effort cleanup; the job result must be based on backup success, not temp deletion.
        }
    }
}
