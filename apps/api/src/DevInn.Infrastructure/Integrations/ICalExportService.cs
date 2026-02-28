using DevInn.Application.Common.ICal.Abstractions;

using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Ical.Net.Serialization;

namespace DevInn.Infrastructure.Integrations;

internal sealed class ICalExportService : IICalExportService
{
    public Task<string> GenerateICalFeedAsync(
        string roomName,
        IEnumerable<ICalEventDto> events,
        CancellationToken cancellationToken = default)
    {
        var calendar = new Calendar
        {
            ProductId = "-//DevInn//Booking Calendar//PT",
            Version = "2.0",
            Scale = "GREGORIAN"
        };

        calendar.AddProperty("X-WR-CALNAME", $"DevInn - {roomName}");
        calendar.AddProperty("X-WR-TIMEZONE", "America/Sao_Paulo");

        foreach (var eventDto in events)
        {
            var calendarEvent = new CalendarEvent
            {
                Uid = eventDto.Uid,
                Summary = eventDto.Summary,
                Start = new CalDateTime(eventDto.Start.Date),
                End = new CalDateTime(eventDto.End.Date),
                Status = "CONFIRMED",
                Transparency = TransparencyType.Opaque
            };

            if (!string.IsNullOrWhiteSpace(eventDto.Description))
            {
                calendarEvent.Description = eventDto.Description;
            }

            calendar.Events.Add(calendarEvent);
        }

        var serializer = new CalendarSerializer();
        var iCalContent = serializer.SerializeToString(calendar);

        return Task.FromResult(iCalContent)!;
    }
}