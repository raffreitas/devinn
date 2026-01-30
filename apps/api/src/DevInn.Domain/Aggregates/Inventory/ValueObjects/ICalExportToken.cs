using System.Security.Cryptography;

using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory.ValueObjects;

public sealed record ICalExportToken : IValueObject
{
    private const int InnIdEncodedLength = 22;

    public string Value { get; private init; }

    private ICalExportToken(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Token de exportação iCal não pode ser vazio.");

        if (value.Length < 32)
            throw new DomainException("Token de exportação iCal deve ter pelo menos 32 caracteres.");

        Value = value;
    }

    public static ICalExportToken Generate(Guid innId)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(24);
        var randomPart = Base64UrlEncode(randomBytes);

        // Encode innId into the token (first 22 chars = base64url(innId))
        var innIdBytes = innId.ToByteArray();
        var innIdPart = Base64UrlEncode(innIdBytes);

        var token = $"{innIdPart}{randomPart}";

        return new ICalExportToken(token);
    }

    public static ICalExportToken FromString(string value)
    {
        return new ICalExportToken(value);
    }

    public Guid ExtractInnId()
    {
        try
        {
            // First 22 chars are the base64url-encoded innId
            if (Value.Length < InnIdEncodedLength)
                throw new DomainException("Token de exportação iCal inválido.");

            var innIdPart = Value[..InnIdEncodedLength];
            var innIdBytes = Base64UrlDecode(innIdPart);
            return new Guid(innIdBytes);
        }
        catch (FormatException)
        {
            throw new DomainException("Token de exportação iCal inválido.");
        }
        catch (ArgumentException)
        {
            throw new DomainException("Token de exportação iCal inválido.");
        }
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

    private static byte[] Base64UrlDecode(string value)
    {
        var base64 = value.Replace('-', '+').Replace('_', '/');
        var padding = (4 - (base64.Length % 4)) % 4;
        if (padding > 0)
            base64 += new string('=', padding);

        return Convert.FromBase64String(base64);
    }
}