namespace DevInn.Backup.Storage;

internal sealed record S3Object(string Key, DateTimeOffset LastModified, long SizeBytes);
