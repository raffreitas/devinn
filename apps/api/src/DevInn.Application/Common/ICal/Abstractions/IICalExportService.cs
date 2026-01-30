namespace DevInn.Application.Common.ICal.Abstractions;

public interface IICalExportService
{
    Task<string> GenerateICalFeedAsync(
        string roomName,
        IEnumerable<ICalEventDto> events,
        CancellationToken cancellationToken = default);
}