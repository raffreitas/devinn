using System.Globalization;

namespace DevInn.Backup.Manifests;

internal static class BackupName
{
    private const string FilePrefix = "devinn-postgres-";
    private const string Extension = ".dump";
    private const string TimestampFormat = "yyyyMMdd-HHmmss'Z'";

    public static string GenerateFileName(DateTimeOffset timestamp)
        => $"{FilePrefix}{timestamp.UtcDateTime.ToString(TimestampFormat, CultureInfo.InvariantCulture)}{Extension}";

    public static string GenerateKey(string prefix, DateTimeOffset timestamp)
        => $"{NormalizePrefix(prefix)}/{GenerateFileName(timestamp)}";

    public static string GenerateManifestKey(string prefix, DateTimeOffset timestamp)
        => $"{NormalizePrefix(prefix)}/manifests/{Path.GetFileNameWithoutExtension(GenerateFileName(timestamp))}.json";

    public static bool TryParseKey(string expectedPrefix, string key, out BackupObject backup)
    {
        backup = default;

        var normalizedPrefix = NormalizePrefix(expectedPrefix);
        var expectedPathPrefix = $"{normalizedPrefix}/";

        if (!key.StartsWith(expectedPathPrefix, StringComparison.Ordinal))
            return false;

        var fileName = key[expectedPathPrefix.Length..];
        if (!fileName.StartsWith(FilePrefix, StringComparison.Ordinal) ||
            !fileName.EndsWith(Extension, StringComparison.Ordinal) ||
            fileName.Contains('/'))
            return false;

        var timestampText = fileName[FilePrefix.Length..^Extension.Length];
        if (!DateTimeOffset.TryParseExact(
                timestampText,
                TimestampFormat,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var timestamp))
            return false;

        backup = new BackupObject(key, timestamp, null);
        return true;
    }

    private static string NormalizePrefix(string prefix)
        => prefix.Trim().Trim('/');
}

internal readonly record struct BackupObject(string Key, DateTimeOffset CreatedAt, long? SizeBytes);
