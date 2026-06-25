namespace DevInn.Backup.Configuration;

internal sealed record BackupOptions
{
    public const string SectionName = "Backup";

    public string DatabaseUrl { get; init; } = string.Empty;
    public Uri? S3Endpoint { get; init; }
    public string S3Bucket { get; init; } = string.Empty;
    public string S3AccessKeyId { get; init; } = string.Empty;
    public string S3SecretAccessKey { get; init; } = string.Empty;
    public string S3Region { get; init; } = "auto";
    public string S3Prefix { get; init; } = "devinn/postgres";
    public bool S3ForcePathStyle { get; init; } = true;
    public int RetentionDaily { get; init; } = 7;
    public int RetentionWeekly { get; init; } = 4;
    public int RetentionMonthly { get; init; } = 6;
    public bool OTelEnabled { get; init; } = true;
    public string PgDumpPath { get; init; } = "pg_dump";
    public string PgRestorePath { get; init; } = "pg_restore";
    public int DumpCompressionLevel { get; init; } = 9;
    public int DumpTimeoutMinutes { get; init; } = 30;
    public string WorkingDirectory { get; init; } = Path.GetTempPath();
}
