using System.ComponentModel.DataAnnotations;

using DevInn.Infrastructure.BackgroundJobs.Options;

using Shouldly;

namespace DevInn.UnitTests.Infrastructure.BackgroundJobs.Configuration;

[Trait("Category", "Unit")]
[Trait("Category", "Infrastructure")]
public sealed class BackgroundJobsOptionsTests
{
    [Fact]
    public void Defaults_ShouldBeValid()
    {
        var options = new BackgroundJobsOptions();

        var results = Validate(options);

        results.ShouldBeEmpty();
        options.ChannelSyncBatchSize.ShouldBe(100);
        options.ChannelSyncMaxDegreeOfParallelism.ShouldBe(5);
        options.ICalHttpTimeoutSeconds.ShouldBe(30);
    }

    [Fact]
    public void Validation_ShouldRejectInvalidBatchAndParallelism()
    {
        var options = new BackgroundJobsOptions
        {
            ChannelSyncBatchSize = 0,
            ChannelSyncMaxDegreeOfParallelism = 0,
            ICalHttpTimeoutSeconds = 0
        };

        var results = Validate(options);

        results.Count.ShouldBe(3);
    }

    private static List<ValidationResult> Validate(BackgroundJobsOptions options)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(options, new ValidationContext(options), results, validateAllProperties: true);
        return results;
    }
}
