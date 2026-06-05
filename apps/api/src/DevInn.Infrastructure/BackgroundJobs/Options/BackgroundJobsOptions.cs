using System.ComponentModel.DataAnnotations;

namespace DevInn.Infrastructure.BackgroundJobs.Options;

internal sealed record BackgroundJobsOptions
{
    public const string SectionName = "BackgroundJobs";
    public bool Enabled { get; init; } = true;

    [Required] public string CronExpression { get; init; } = "0 */15 * * * ?";

    [Range(1, 1000)] public int ChannelSyncBatchSize { get; init; } = 100;

    [Range(1, 50)] public int ChannelSyncMaxDegreeOfParallelism { get; init; } = 5;

    [Range(1, 300)] public int ICalHttpTimeoutSeconds { get; init; } = 30;
}