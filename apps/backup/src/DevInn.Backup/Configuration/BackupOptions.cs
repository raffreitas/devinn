using System.ComponentModel.DataAnnotations;

namespace DevInn.Backup.Configuration;

internal sealed record BackupOptions
{
    public required string DatabaseUrl { get; init; }
    public required Uri S3Endpoint { get; init; }
    public required string S3Bucket { get; init; }
    public required string S3AccessKeyId { get; init; }
    public required string S3SecretAccessKey { get; init; }
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

    public static BackupOptions FromEnvironment(IReadOnlyDictionary<string, string?> environment)
    {
        var endpoint = GetRequired(environment, "BACKUP_S3_ENDPOINT");

        var options = new BackupOptions
        {
            DatabaseUrl = GetRequired(environment, "BACKUP_DATABASE_URL"),
            S3Endpoint = new Uri(endpoint, UriKind.Absolute),
            S3Bucket = GetRequired(environment, "BACKUP_S3_BUCKET"),
            S3AccessKeyId = GetRequired(environment, "BACKUP_S3_ACCESS_KEY_ID"),
            S3SecretAccessKey = GetRequired(environment, "BACKUP_S3_SECRET_ACCESS_KEY"),
            S3Region = GetOptional(environment, "BACKUP_S3_REGION", "auto"),
            S3Prefix = NormalizePrefix(GetOptional(environment, "BACKUP_S3_PREFIX", "devinn/postgres")),
            S3ForcePathStyle = GetBool(environment, "BACKUP_S3_FORCE_PATH_STYLE", true),
            RetentionDaily = GetPositiveInt(environment, "BACKUP_RETENTION_DAILY", 7),
            RetentionWeekly = GetPositiveInt(environment, "BACKUP_RETENTION_WEEKLY", 4),
            RetentionMonthly = GetPositiveInt(environment, "BACKUP_RETENTION_MONTHLY", 6),
            OTelEnabled = GetBool(environment, "BACKUP_OTEL_ENABLED", true),
            PgDumpPath = GetOptional(environment, "BACKUP_PG_DUMP_PATH", "pg_dump"),
            PgRestorePath = GetOptional(environment, "BACKUP_PG_RESTORE_PATH", "pg_restore"),
            DumpCompressionLevel = GetInt(environment, "BACKUP_DUMP_COMPRESSION_LEVEL", 9),
            DumpTimeoutMinutes = GetPositiveInt(environment, "BACKUP_DUMP_TIMEOUT_MINUTES", 30),
            WorkingDirectory = GetOptional(environment, "BACKUP_WORKING_DIRECTORY", Path.GetTempPath())
        };

        options.Validate();
        return options;
    }

    public void Validate()
    {
        if (S3Endpoint.Scheme != Uri.UriSchemeHttps && S3Endpoint.Scheme != Uri.UriSchemeHttp)
            throw new ValidationException("BACKUP_S3_ENDPOINT must be an HTTP or HTTPS URI.");

        if (string.IsNullOrWhiteSpace(S3Bucket))
            throw new ValidationException("BACKUP_S3_BUCKET is required.");

        if (RetentionDaily < 1 || RetentionWeekly < 1 || RetentionMonthly < 1)
            throw new ValidationException("Retention values must be greater than zero.");

        if (DumpCompressionLevel is < 0 or > 9)
            throw new ValidationException("BACKUP_DUMP_COMPRESSION_LEVEL must be between 0 and 9.");

        if (string.IsNullOrWhiteSpace(PgDumpPath) || string.IsNullOrWhiteSpace(PgRestorePath))
            throw new ValidationException("PostgreSQL client paths are required.");
    }

    private static string GetRequired(IReadOnlyDictionary<string, string?> environment, string name)
    {
        if (!environment.TryGetValue(name, out var value) || string.IsNullOrWhiteSpace(value))
            throw new ValidationException($"{name} is required.");

        return value;
    }

    private static string GetOptional(IReadOnlyDictionary<string, string?> environment, string name, string defaultValue)
        => environment.TryGetValue(name, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : defaultValue;

    private static int GetPositiveInt(IReadOnlyDictionary<string, string?> environment, string name, int defaultValue)
    {
        if (!environment.TryGetValue(name, out var value) || string.IsNullOrWhiteSpace(value))
            return defaultValue;

        if (!int.TryParse(value, out var parsed) || parsed < 1)
            throw new ValidationException($"{name} must be a positive integer.");

        return parsed;
    }

    private static int GetInt(IReadOnlyDictionary<string, string?> environment, string name, int defaultValue)
    {
        if (!environment.TryGetValue(name, out var value) || string.IsNullOrWhiteSpace(value))
            return defaultValue;

        if (!int.TryParse(value, out var parsed))
            throw new ValidationException($"{name} must be an integer.");

        return parsed;
    }

    private static bool GetBool(IReadOnlyDictionary<string, string?> environment, string name, bool defaultValue)
    {
        if (!environment.TryGetValue(name, out var value) || string.IsNullOrWhiteSpace(value))
            return defaultValue;

        return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
               value.Equals("1", StringComparison.OrdinalIgnoreCase) ||
               value.Equals("yes", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizePrefix(string prefix)
        => prefix.Trim().Trim('/');
}
