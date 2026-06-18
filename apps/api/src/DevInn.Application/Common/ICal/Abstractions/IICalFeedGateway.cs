namespace DevInn.Application.Common.ICal.Abstractions;

public interface IICalFeedGateway
{
    Task<IReadOnlyList<ICalEventDto>> ParseICalFeedAsync(string iCalUrl, CancellationToken cancellationToken = default);
}

public sealed record ICalEventDto(
    string Uid,
    string Summary,
    DateTimeOffset Start,
    DateTimeOffset End,
    string? Description = null
);
