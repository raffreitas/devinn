namespace DevInn.Application.Common.ICal.Abstractions;

public interface IICalService
{
    Task<IEnumerable<ICalEventDto>> ParseICalFeedAsync(string iCalUrl, CancellationToken cancellationToken = default);
}

public sealed record ICalEventDto(
    string Uid,
    string Summary,
    DateTimeOffset Start,
    DateTimeOffset End,
    string? Description = null
);