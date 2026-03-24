using System.ComponentModel.DataAnnotations;

namespace DevInn.Infrastructure.Identity.Options;

internal sealed record PasswordResetOptions
{
    public const string SectionName = "PasswordReset";

    [Required] [Url] public required string FrontendBaseUrl { get; init; }

    [Range(1, 1440)] public required int TokenLifetimeInMinutes { get; init; }
}