using DevInn.Backup.Configuration;
using Microsoft.Extensions.Configuration;
using Shouldly;

namespace DevInn.Backup.Tests.Configuration;

public sealed class BackupOptionsTests
{
    [Fact]
    public void EnvironmentMapping_MapsBackupVariablesToOptionsSection()
    {
        var environment = new Dictionary<string, string?>
        {
            ["BACKUP_DATABASE_URL"] = "Host=localhost;Database=devinn;Username=postgres;Password=postgres",
            ["BACKUP_S3_ENDPOINT"] = "https://example.r2.cloudflarestorage.com",
            ["BACKUP_S3_BUCKET"] = "devinn-backups",
            ["BACKUP_S3_ACCESS_KEY_ID"] = "access",
            ["BACKUP_S3_SECRET_ACCESS_KEY"] = "secret",
            ["BACKUP_RETENTION_DAILY"] = "9"
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(BackupEnvironmentVariables.Read(environment.GetValueOrDefault))
            .Build();

        var options = configuration
            .GetSection(BackupOptions.SectionName)
            .Get<BackupOptions>();

        options.ShouldNotBeNull();
        options.DatabaseUrl.ShouldBe(environment["BACKUP_DATABASE_URL"]);
        options.S3Endpoint.ShouldBe(new Uri("https://example.r2.cloudflarestorage.com"));
        options.S3Bucket.ShouldBe("devinn-backups");
        options.S3Prefix.ShouldBe("devinn/postgres");
        options.RetentionDaily.ShouldBe(9);
        options.RetentionWeekly.ShouldBe(4);
        options.RetentionMonthly.ShouldBe(6);
        options.S3Region.ShouldBe("auto");
        options.S3ForcePathStyle.ShouldBeTrue();
        options.DumpCompressionLevel.ShouldBe(9);
        options.DumpTimeoutMinutes.ShouldBe(30);
    }

    [Fact]
    public void Validator_RejectsMissingRequiredOptions()
    {
        var result = new BackupOptionsValidator().Validate(null, new BackupOptions());

        result.Failed.ShouldBeTrue();
        result.Failures.ShouldContain("Backup:DatabaseUrl is required.");
        result.Failures.ShouldContain("Backup:S3Endpoint is required.");
        result.Failures.ShouldContain("Backup:S3Bucket is required.");
    }
}
