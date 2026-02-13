namespace DevInn.Domain.SeedWork;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException) : base(message, innerException)
    {
    }

    public static void ThrowIfNull(object? value, string? propertyName = null)
    {
        string message = string.IsNullOrWhiteSpace(propertyName)
            ? "O objeto não pode ser nulo."
            : $"O campo '{propertyName}' não pode ser nulo.";

        if (value is null)
            throw new DomainException(message);
    }

    public static void ThrowIfNullOrWhiteSpace(string? value, string? propertyName = "")
    {
        string message = string.IsNullOrWhiteSpace(propertyName)
            ? "O objeto não pode ser nulo ou vazio."
            : $"O campo '{propertyName}' não pode ser nulo ou vazio.";

        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException(message);
    }
}