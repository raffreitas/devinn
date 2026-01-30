using System.Security.Cryptography;

using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory.ValueObjects;

public sealed record ICalExportToken : IValueObject
{
    private const int MinTokenLength = 32;

    public string Value { get; private init; }

    private ICalExportToken(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Token de exportação iCal não pode ser vazio.");

        if (value.Length < MinTokenLength)
            throw new DomainException("Token de exportação iCal deve ter pelo menos 32 caracteres.");

        Value = value;
    }

    public static ICalExportToken Generate()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        var token = Base64UrlEncode(randomBytes);
        return new ICalExportToken(token);
    }

    public static ICalExportToken FromString(string value)
    {
        return new ICalExportToken(value);
    }

    public override string ToString() => Value;

    public static implicit operator string(ICalExportToken token) => token.Value;

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
}