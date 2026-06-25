using Microsoft.Extensions.Configuration;

namespace DevInn.Backup.Configuration;

internal static class BackupEnvironmentVariables
{
    private static readonly IReadOnlyDictionary<string, string> Mappings = new Dictionary<string, string>
    {
        ["BACKUP_DATABASE_URL"] = "Backup:DatabaseUrl",
        ["BACKUP_S3_ENDPOINT"] = "Backup:S3Endpoint",
        ["BACKUP_S3_BUCKET"] = "Backup:S3Bucket",
        ["BACKUP_S3_ACCESS_KEY_ID"] = "Backup:S3AccessKeyId",
        ["BACKUP_S3_SECRET_ACCESS_KEY"] = "Backup:S3SecretAccessKey",
        ["BACKUP_S3_REGION"] = "Backup:S3Region",
        ["BACKUP_S3_PREFIX"] = "Backup:S3Prefix",
        ["BACKUP_S3_FORCE_PATH_STYLE"] = "Backup:S3ForcePathStyle",
        ["BACKUP_RETENTION_DAILY"] = "Backup:RetentionDaily",
        ["BACKUP_RETENTION_WEEKLY"] = "Backup:RetentionWeekly",
        ["BACKUP_RETENTION_MONTHLY"] = "Backup:RetentionMonthly",
        ["BACKUP_OTEL_ENABLED"] = "Backup:OTelEnabled",
        ["BACKUP_WORKING_DIRECTORY"] = "Backup:WorkingDirectory",
        ["BACKUP_PG_DUMP_PATH"] = "Backup:PgDumpPath",
        ["BACKUP_PG_RESTORE_PATH"] = "Backup:PgRestorePath",
        ["BACKUP_DUMP_COMPRESSION_LEVEL"] = "Backup:DumpCompressionLevel",
        ["BACKUP_DUMP_TIMEOUT_MINUTES"] = "Backup:DumpTimeoutMinutes"
    };

    public static void AddBackupEnvironmentVariables(this IConfigurationBuilder configuration)
    {
        configuration.AddInMemoryCollection(Read(Environment.GetEnvironmentVariable));
    }

    internal static IEnumerable<KeyValuePair<string, string?>> Read(Func<string, string?> getEnvironmentVariable)
    {
        foreach (var (environmentName, configurationKey) in Mappings)
        {
            var value = getEnvironmentVariable(environmentName);
            if (!string.IsNullOrWhiteSpace(value))
                yield return new KeyValuePair<string, string?>(configurationKey, value);
        }
    }
}
