namespace DevInn.Infrastructure.Observability.Options;

internal sealed record ObservabilityOptions
{
    public const string SectionName = "Observability";
    public bool Enabled { get; init; } = true;
};