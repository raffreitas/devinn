namespace DevInn.Application.Features.Integrations.Services;

public interface INextSyncTimeProvider
{
    DateTimeOffset GetNextSyncAt(DateTimeOffset from);
}
