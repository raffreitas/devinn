using DevInn.Application.Common.ICal.Abstractions;

using Ical.Net;
using Ical.Net.CalendarComponents;

namespace DevInn.Infrastructure.Integrations;

internal sealed class ICalService(IHttpClientFactory httpClientFactory) : IICalService
{
    public async Task<IEnumerable<ICalEventDto>> ParseICalFeedAsync(string iCalUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var httpClient = httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

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
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to parse iCal content from {iCalUrl}", ex);
        }
    }

    private static ICalEventDto MapToDto(CalendarEvent calendarEvent)
    {
        var start = calendarEvent.Start!.AsUtc;
        var end = calendarEvent.End!.AsUtc;

        return new ICalEventDto(
            Uid: calendarEvent.Uid!,
            Summary: calendarEvent.Summary ?? "Untitled Event",
            Start: start,
            End: end,
            Description: calendarEvent.Description
        );
    }
}