using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Application.Features.Integrations.Queries.PreviewICalFeed;
using DevInn.Domain.Aggregates.Integrations.Enums;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Integrations.Queries.PreviewICalFeed;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class PreviewICalFeedHandlerTests
{
    private readonly IICalFeedGateway _iCalFeedGateway = Substitute.For<IICalFeedGateway>();
    private readonly PreviewICalFeedHandler _sut;

    public PreviewICalFeedHandlerTests()
    {
        _sut = new PreviewICalFeedHandler(_iCalFeedGateway);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidPreview_WhenFeedCanBeParsed()
    {
        var query = new PreviewICalFeedQuery(ChannelType.Booking, "https://example.com/feed.ics");
        _iCalFeedGateway.ParseICalFeedAsync(query.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Reserved", DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddDays(1)),
            new ICalEventDto("event-2", "Reserved", DateTimeOffset.UtcNow.AddDays(2), DateTimeOffset.UtcNow.AddDays(3))
        ]);

        var result = await _sut.Handle(query, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.IsValid.ShouldBeTrue();
        result.Value.EventCount.ShouldBe(2);
    }

    [Fact]
    public async Task Handle_ShouldReturnInvalidPreview_WhenFeedCannotBeParsed()
    {
        var query = new PreviewICalFeedQuery(ChannelType.Airbnb, "https://example.com/feed.ics");
        _iCalFeedGateway
            .ParseICalFeedAsync(query.ICalUrl, TestContext.Current.CancellationToken)
            .Returns<Task<IReadOnlyList<ICalEventDto>>>(_ => throw new InvalidOperationException("Feed unavailable"));

        var result = await _sut.Handle(query, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.IsValid.ShouldBeFalse();
        result.Value.EventCount.ShouldBe(0);
        result.Value.Message.ShouldContain("Não foi possível ler este calendário");
    }
}
