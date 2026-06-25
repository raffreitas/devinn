namespace DevInn.Backup.Manifests;

internal sealed record BackupManifest(
    int Version,
    string ApplicationName,
    string BucketName,
    string DumpObjectKey,
    string ManifestObjectKey,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset CompletedAtUtc,
    double DurationSeconds,
    long SizeBytes,
    string Sha256Checksum,
    int RetentionDaily,
    int RetentionWeekly,
    int RetentionMonthly,
    int DeletedExpiredCount);
