using System.Globalization;
using DevInn.Backup.Manifests;

namespace DevInn.Backup.Retention;

internal sealed class RetentionPolicy(int dailyCount, int weeklyCount, int monthlyCount)
{
    public IReadOnlyCollection<BackupObject> SelectExpiredBackups(
        string prefix,
        IReadOnlyCollection<BackupObject> objects)
    {
        var validBackups = objects
            .Where(obj => BackupName.TryParseKey(prefix, obj.Key, out _))
            .OrderByDescending(obj => obj.CreatedAt)
            .ToArray();

        var keptKeys = new HashSet<string>(StringComparer.Ordinal);

        KeepLatestByGroup(
            validBackups,
            backup => backup.CreatedAt.UtcDateTime.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            dailyCount,
            keptKeys);

        KeepLatestByGroup(
            validBackups,
            backup =>
            {
                var utc = backup.CreatedAt.UtcDateTime;
                var week = ISOWeek.GetWeekOfYear(utc);
                var year = ISOWeek.GetYear(utc);
                return $"{year:D4}-W{week:D2}";
            },
            weeklyCount,
            keptKeys);

        KeepLatestByGroup(
            validBackups,
            backup => backup.CreatedAt.UtcDateTime.ToString("yyyy-MM", CultureInfo.InvariantCulture),
            monthlyCount,
            keptKeys);

        return validBackups
            .Where(backup => !keptKeys.Contains(backup.Key))
            .OrderBy(backup => backup.CreatedAt)
            .ToArray();
    }

    private static void KeepLatestByGroup(
        IReadOnlyCollection<BackupObject> backups,
        Func<BackupObject, string> groupKeySelector,
        int groupsToKeep,
        HashSet<string> keptKeys)
    {
        foreach (var backup in backups
                     .GroupBy(groupKeySelector)
                     .OrderByDescending(group => group.Max(item => item.CreatedAt))
                     .Take(groupsToKeep)
                     .Select(group => group.OrderByDescending(item => item.CreatedAt).First()))
        {
            keptKeys.Add(backup.Key);
        }
    }
}
