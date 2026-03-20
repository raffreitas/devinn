using DevInn.Application.Features.Integrations.Services;
using DevInn.Infrastructure.BackgroundJobs.Options;

using Microsoft.Extensions.Options;

using Quartz;

namespace DevInn.Infrastructure.BackgroundJobs.Providers;

internal sealed class QuartzNextSyncTimeProvider(IOptions<BackgroundJobsOptions> options) : INextSyncTimeProvider
{
    private readonly CronExpression _cronExpression = new(options.Value.CronExpression);

    public DateTimeOffset GetNextSyncAt(DateTimeOffset from)
    {
        var nextSyncAt = _cronExpression.GetNextValidTimeAfter(from);

        return nextSyncAt ?? throw new InvalidOperationException(
            $"Cron expression '{options.Value.CronExpression}' does not produce a next execution time.");
    }
}
