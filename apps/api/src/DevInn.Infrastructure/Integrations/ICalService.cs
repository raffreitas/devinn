using DevInn.Application.Common.ICal.Abstractions;

using Ical.Net;
using Ical.Net.CalendarComponents;

namespace DevInn.Infrastructure.Integrations;

internal sealed class ICalService(IHttpClientFactory httpClientFactory) : IICalService
{
    internal const string HttpClientName = "ICal";
    private const int AllDayNormalizationHourUtc = 12;

    public async Task<IReadOnlyList<ICalEventDto>> ParseICalFeedAsync(string iCalUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var httpClient = httpClientFactory.CreateClient(HttpClientName);

            var response = await httpClient.GetAsync(iCalUrl, cancellationToken);
            response.EnsureSuccessStatusCode();

            var iCalContent = await response.Content.ReadAsStringAsync(cancellationToken);

            var calendar = Calendar.Load(iCalContent);
            var events = calendar?.Events ?? Enumerable.Empty<CalendarEvent>();

            return events.Select(MapToDto).ToList();
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException($"Failed to fetch iCal feed from {iCalUrl}", ex);
        }
    }

    private static ICalEventDto MapToDto(CalendarEvent calendarEvent)
    {
        var start = NormalizeEventDate(calendarEvent.Start!, calendarEvent.IsAllDay);
        var end = NormalizeEventDate(calendarEvent.End!, calendarEvent.IsAllDay);

        return new ICalEventDto(
            Uid: calendarEvent.Uid!,
            Summary: calendarEvent.Summary ?? "Untitled Event",
            Start: start,
            End: end,
            Description: calendarEvent.Description
        );
    }

    private static DateTimeOffset NormalizeEventDate(Ical.Net.DataTypes.CalDateTime eventDate, bool isAllDay)
    {
        if (!isAllDay)
            return new DateTimeOffset(eventDate.AsUtc, TimeSpan.Zero);

        return new DateTimeOffset(
            eventDate.Date.ToDateTime(new TimeOnly(AllDayNormalizationHourUtc, 0), DateTimeKind.Utc),
            TimeSpan.Zero);
    }
}
