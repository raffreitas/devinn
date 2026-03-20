using DevInn.Infrastructure.BackgroundJobs.Options;
using DevInn.Infrastructure.BackgroundJobs.Providers;

using Microsoft.Extensions.Options;

using Shouldly;

namespace DevInn.UnitTests.Infrastructure.BackgroundJobs.Providers;

[Trait("Category", "Unit")]
[Trait("Category", "Infrastructure")]
public sealed class QuartzNextSyncTimeProviderTests
{
    [Fact]
    public void GetNextSyncAt_ShouldReturnNextOccurrenceFromCronExpression()
    {
        var options = Options.Create(new BackgroundJobsOptions
        {
            CronExpression = "0 */15 * * * ?"
        });
        var sut = new QuartzNextSyncTimeProvider(options);

        var nextSyncAt = sut.GetNextSyncAt(new DateTimeOffset(2026, 03, 20, 12, 7, 0, TimeSpan.Zero));

        nextSyncAt.ShouldBe(new DateTimeOffset(2026, 03, 20, 12, 15, 0, TimeSpan.Zero));
    }
}
