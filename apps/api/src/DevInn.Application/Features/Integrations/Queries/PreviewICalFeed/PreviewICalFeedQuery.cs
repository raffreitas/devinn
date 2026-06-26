using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Integrations.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Integrations.Queries.PreviewICalFeed;

public sealed record PreviewICalFeedQuery(
    ChannelType ChannelType,
    string ICalUrl) : IQuery<Result<PreviewICalFeedResponse>>
{
    public Validation Validate() => new PreviewICalFeedQueryValidator().Validate(this).ToFailure();
}

public sealed record PreviewICalFeedResponse(
    bool IsValid,
    int EventCount,
    string Message);

internal sealed class PreviewICalFeedQueryValidator : AbstractValidator<PreviewICalFeedQuery>
{
    public PreviewICalFeedQueryValidator()
    {
        RuleFor(x => x.ChannelType)
            .IsInEnum().WithMessage("Tipo de canal inválido.");

        RuleFor(x => x.ICalUrl)
            .NotEmpty().WithMessage("URL do calendário é obrigatória.")
            .Must(BeValidHttpsUrl).WithMessage("URL do calendário deve ser uma URL HTTPS válida.");
    }

    private static bool BeValidHttpsUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }
}
