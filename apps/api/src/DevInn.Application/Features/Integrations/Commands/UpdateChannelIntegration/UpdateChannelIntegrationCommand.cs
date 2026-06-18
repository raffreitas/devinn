using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.UpdateChannelIntegration;

public sealed record UpdateChannelIntegrationCommand(
    Guid Id,
    string ICalUrl,
    Guid RoomId,
    bool IsActive
) : ICommand<Result>
{
    public Validation Validate() => new UpdateChannelIntegrationCommandValidator().Validate(this).ToFailure();
}

internal sealed class UpdateChannelIntegrationCommandValidator : AbstractValidator<UpdateChannelIntegrationCommand>
{
    public UpdateChannelIntegrationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID da integração é obrigatório.");

        RuleFor(x => x.ICalUrl)
            .NotEmpty().WithMessage("iCal URL é obrigatória.")
            .Must(BeValidHttpsUrl).WithMessage("iCal URL deve ser uma URL HTTPS válida.");

        RuleFor(x => x.RoomId)
            .NotEmpty().WithMessage("Quarto é obrigatório.");
    }

    private static bool BeValidHttpsUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }
}