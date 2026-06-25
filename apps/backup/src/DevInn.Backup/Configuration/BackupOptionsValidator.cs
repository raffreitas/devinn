using Microsoft.Extensions.Options;

namespace DevInn.Backup.Configuration;

internal sealed class BackupOptionsValidator : IValidateOptions<BackupOptions>
{
    public ValidateOptionsResult Validate(string? name, BackupOptions options)
    {
        var failures = new List<string>();

        Require(options.DatabaseUrl, "Backup:DatabaseUrl", failures);
        Require(options.S3Bucket, "Backup:S3Bucket", failures);
        Require(options.S3AccessKeyId, "Backup:S3AccessKeyId", failures);
        Require(options.S3SecretAccessKey, "Backup:S3SecretAccessKey", failures);
        Require(options.PgDumpPath, "Backup:PgDumpPath", failures);
        Require(options.PgRestorePath, "Backup:PgRestorePath", failures);

        if (options.S3Endpoint is null)
        {
            failures.Add("Backup:S3Endpoint is required.");
        }
        else if (options.S3Endpoint.Scheme != Uri.UriSchemeHttps && options.S3Endpoint.Scheme != Uri.UriSchemeHttp)
        {
            failures.Add("Backup:S3Endpoint must be an HTTP or HTTPS URI.");
        }

        if (options.RetentionDaily < 1 || options.RetentionWeekly < 1 || options.RetentionMonthly < 1)
            failures.Add("Retention values must be greater than zero.");

        if (options.DumpCompressionLevel is < 0 or > 9)
            failures.Add("Backup:DumpCompressionLevel must be between 0 and 9.");

        if (options.DumpTimeoutMinutes < 1)
            failures.Add("Backup:DumpTimeoutMinutes must be greater than zero.");

        return failures.Count == 0
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail(failures);
    }

    private static void Require(string value, string name, List<string> failures)
    {
        if (string.IsNullOrWhiteSpace(value))
            failures.Add($"{name} is required.");
    }
}
