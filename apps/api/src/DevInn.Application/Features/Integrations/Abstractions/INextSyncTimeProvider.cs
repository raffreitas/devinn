namespace DevInn.Application.Features.Integrations.Abstractions;

public interface INextSyncTimeProvider
{
    DateTimeOffset GetNextSyncAt(DateTimeOffset from);
}