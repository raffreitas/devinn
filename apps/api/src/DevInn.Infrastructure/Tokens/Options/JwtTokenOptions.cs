using System.ComponentModel.DataAnnotations;

namespace DevInn.Infrastructure.Tokens.Options;

public sealed record JwtTokenOptions
{
    public const string SectionName = "Jwt";

    [Required] public required string Issuer { get; init; }
    [Required] public required string Audience { get; init; }
    [Required] public required int ExpirationInMinutes { get; init; }
    [Required] public required string SecretKey { get; init; }
};