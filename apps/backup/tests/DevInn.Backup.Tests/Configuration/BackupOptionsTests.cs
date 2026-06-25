using System.ComponentModel.DataAnnotations;
using DevInn.Backup.Configuration;
using Shouldly;

namespace DevInn.Backup.Tests.Configuration;

public sealed class BackupOptionsTests
{
    [Fact]
    public void FromEnvironment_RequiresSecretsAndConnectionString()
    {
        Should.Throw<ValidationException>(() =>
            BackupOptions.FromEnvironment(new Dictionary<string, string?>()));
    }

    [Fact]
    public void FromEnvironment_UsesDefaultRetentionAndPrefix()
    {
        var options = BackupOptions.FromEnvironment(new Dictionary<string, string?>
        {
            ["BACKUP_DATABASE_URL"] = "Host=localhost;Database=devinn;Username=postgres;Password=postgres",
            ["BACKUP_S3_ENDPOINT"] = "https://example.r2.cloudflarestorage.com",
            ["BACKUP_S3_BUCKET"] = "devinn-backups",
            ["BACKUP_S3_ACCESS_KEY_ID"] = "access",
            ["BACKUP_S3_SECRET_ACCESS_KEY"] = "secret"
        });

        options.S3Prefix.ShouldBe("devinn/postgres");
        options.RetentionDaily.ShouldBe(7);
        options.RetentionWeekly.ShouldBe(4);
        options.RetentionMonthly.ShouldBe(6);
        options.S3Region.ShouldBe("auto");
        options.S3ForcePathStyle.ShouldBeTrue();
        options.DumpCompressionLevel.ShouldBe(9);
        options.DumpTimeoutMinutes.ShouldBe(30);
    }
}
