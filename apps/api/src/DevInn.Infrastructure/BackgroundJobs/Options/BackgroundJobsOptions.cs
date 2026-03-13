using System.ComponentModel.DataAnnotations;

namespace DevInn.Infrastructure.BackgroundJobs.Options;

internal sealed record BackgroundJobsOptions
{
    public const string SectionName = "BackgroundJobs";
    public bool Enabled { get; init; } = true;

    [Required] public string CronExpression { get; init; } = "0 */15 * * * ?";
}