using System.Security.Cryptography;

using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inventory.ValueObjects;

public sealed record ICalExportToken : IValueObject
{
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
        var randomPart = Convert.ToBase64String(randomBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "");

        // Encode innId into the token (first 22 chars = base64url(innId))
        var innIdBytes = innId.ToByteArray();
        var innIdPart = Convert.ToBase64String(innIdBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "");

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
            var innIdPart = Value[..22];

            // Add padding if needed for base64 decoding
            var padding = (4 - (innIdPart.Length % 4)) % 4;
            var base64 = innIdPart + new string('=', padding);

            var innIdBytes = Convert.FromBase64String(base64);
            return new Guid(innIdBytes);
        }
        catch
        {
            throw new DomainException("Token de exportação iCal inválido.");
        }
    }

    public override string ToString() => Value;

    public static implicit operator string(ICalExportToken token) => token.Value;
}