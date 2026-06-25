using DevInn.Backup.Manifests;
using Shouldly;

namespace DevInn.Backup.Tests.Manifests;

public sealed class BackupNameTests
{
    [Fact]
    public void GenerateKey_UsesUtcTimestampAndConfiguredPrefix()
    {
        var timestamp = new DateTimeOffset(2026, 6, 25, 13, 45, 9, TimeSpan.FromHours(-3));

        var key = BackupName.GenerateKey("/devinn/postgres/", timestamp);

        key.ShouldBe("devinn/postgres/devinn-postgres-20260625-164509Z.dump");
    }

    [Fact]
    public void TryParseKey_ReturnsCreatedAtForValidBackupName()
    {
        var parsed = BackupName.TryParseKey(
            "devinn/postgres",
            "devinn/postgres/devinn-postgres-20250625-164509Z.dump",
            out var backup);

        parsed.ShouldBeTrue();
        backup.CreatedAt.ShouldBe(new DateTimeOffset(2025, 6, 25, 16, 45, 9, TimeSpan.Zero));
    }

    [Theory]
    [InlineData("other/devinn-postgres-20250625-164509Z.dump")]
    [InlineData("devinn/postgres/not-a-backup.dump")]
    [InlineData("devinn/postgres/devinn-postgres-20250625-164509Z.sql")]
    [InlineData("devinn/postgres/nested/devinn-postgres-20250625-164509Z.dump")]
    public void TryParseKey_RejectsObjectsOutsideTheBackupPattern(string key)
    {
        var parsed = BackupName.TryParseKey("devinn/postgres", key, out _);

        parsed.ShouldBeFalse();
    }
}
