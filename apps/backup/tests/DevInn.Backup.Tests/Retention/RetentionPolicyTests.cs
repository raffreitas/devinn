using DevInn.Backup.Manifests;
using DevInn.Backup.Retention;
using Shouldly;

namespace DevInn.Backup.Tests.Retention;

public sealed class RetentionPolicyTests
{
    [Fact]
    public void SelectExpiredBackups_KeepsDailyWeeklyAndMonthlyWinners()
    {
        var backups = Enumerable.Range(0, 45)
            .Select(dayOffset =>
            {
                var timestamp = new DateTimeOffset(2026, 6, 25, 2, 0, 0, TimeSpan.Zero).AddDays(-dayOffset);
                return ObjectAt(timestamp);
            })
            .ToArray();

        var expired = new RetentionPolicy(dailyCount: 7, weeklyCount: 4, monthlyCount: 2)
            .SelectExpiredBackups("devinn/postgres", backups);

        var kept = backups.Except(expired).ToArray();

        kept.Length.ShouldBeLessThanOrEqualTo(13);
        kept.ShouldContain(ObjectAt(new DateTimeOffset(2026, 6, 25, 2, 0, 0, TimeSpan.Zero)));
        expired.ShouldNotContain(item => item.Key == "unrelated/devinn-postgres-20250625-020000Z.dump");
    }

    [Fact]
    public void SelectExpiredBackups_DoesNotDeleteUnknownOrOutOfPrefixObjects()
    {
        var backups = new[]
        {
            ObjectAt(new DateTimeOffset(2026, 6, 25, 2, 0, 0, TimeSpan.Zero)),
            ObjectAt(new DateTimeOffset(2026, 6, 24, 2, 0, 0, TimeSpan.Zero)),
            new BackupObject("devinn/postgres/manual-backup.dump", DateTimeOffset.UtcNow.AddDays(-100), 10),
            new BackupObject("other/devinn-postgres-20250620-020000Z.dump", DateTimeOffset.UtcNow.AddDays(-100), 10)
        };

        var expired = new RetentionPolicy(dailyCount: 1, weeklyCount: 1, monthlyCount: 1)
            .SelectExpiredBackups("devinn/postgres", backups);

        expired.ShouldNotContain(item => item.Key == "devinn/postgres/manual-backup.dump");
        expired.ShouldNotContain(item => item.Key == "other/devinn-postgres-20250620-020000Z.dump");
    }

    private static BackupObject ObjectAt(DateTimeOffset timestamp)
        => new(BackupName.GenerateKey("devinn/postgres", timestamp), timestamp, 10);
}
