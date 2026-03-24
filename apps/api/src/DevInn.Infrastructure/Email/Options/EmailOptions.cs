using System.ComponentModel.DataAnnotations;

namespace DevInn.Infrastructure.Email.Options;

internal sealed record EmailOptions
{
    public const string SectionName = "EmailOptions";

    [Required] public required string ApiKey { get; init; }
    [Required] public required string FromAddress { get; init; }
    [Required] public required string FromName { get; init; }
}