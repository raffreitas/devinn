namespace DevInn.Application.Common.Time;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
    DateTime GetLocalNow();
    DateOnly GetLocalDate();
}