namespace DevInn.Domain.SeedWork;

public class DomainException : Exception
{
    public DomainException() : base() { }
    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException) : base(message, innerException)
    {
    }

    public static void ThrowIfNull(object? obj, string? message = null)
    {
        if (obj is null)
            throw new DomainException(message ?? "O objeto não pode ser nulo.");
    }
}