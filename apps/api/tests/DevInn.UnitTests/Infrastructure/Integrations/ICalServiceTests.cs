using System.Net;

using DevInn.Infrastructure.Integrations;

using Shouldly;

namespace DevInn.UnitTests.Infrastructure.Integrations;

[Trait("Category", "Unit")]
[Trait("Category", "Infrastructure")]
public sealed class ICalServiceTests
{
    [Fact]
    public async Task ParseICalFeedAsync_ShouldNormalizeAllDayEventsToMiddayUtc()
    {
        const string icalContent = """
                                   BEGIN:VCALENDAR
                                   VERSION:2.0
                                   BEGIN:VEVENT
                                   UID:all-day-event
                                   DTSTART;VALUE=DATE:20260314
                                   DTEND;VALUE=DATE:20260315
                                   SUMMARY:Blocked
                                   END:VEVENT
                                   END:VCALENDAR
                                   """;

        var sut = CreateSut(icalContent);

        var events = await sut.ParseICalFeedAsync("https://example.com/feed.ics", TestContext.Current.CancellationToken);

        events.ShouldHaveSingleItem();
        events[0].Start.ShouldBe(new DateTimeOffset(2026, 3, 14, 12, 0, 0, TimeSpan.Zero));
        events[0].End.ShouldBe(new DateTimeOffset(2026, 3, 15, 12, 0, 0, TimeSpan.Zero));
    }

    [Fact]
    public async Task ParseICalFeedAsync_ShouldKeepTimedEventsInUtc()
    {
        const string icalContent = """
                                   BEGIN:VCALENDAR
                                   VERSION:2.0
                                   BEGIN:VEVENT
                                   UID:timed-event
                                   DTSTART:20260314T150000Z
                                   DTEND:20260315T110000Z
                                   SUMMARY:Reserved
                                   END:VEVENT
                                   END:VCALENDAR
                                   """;

        var sut = CreateSut(icalContent);

        var events = await sut.ParseICalFeedAsync("https://example.com/feed.ics", TestContext.Current.CancellationToken);

        events.ShouldHaveSingleItem();
        events[0].Start.ShouldBe(new DateTimeOffset(2026, 3, 14, 15, 0, 0, TimeSpan.Zero));
        events[0].End.ShouldBe(new DateTimeOffset(2026, 3, 15, 11, 0, 0, TimeSpan.Zero));
    }

    private static ICalService CreateSut(string icalContent)
    {
        return new ICalService(new StubHttpClientFactory(icalContent));
    }

    private sealed class StubHttpClientFactory(string icalContent) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name)
        {
            return new HttpClient(new StubHttpMessageHandler(icalContent), disposeHandler: true);
        }
    }

    private sealed class StubHttpMessageHandler(string icalContent) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(icalContent)
            });
        }
    }
}