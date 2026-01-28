using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Integrations.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Integrations.Commands.CreateChannelIntegration;

public sealed record CreateChannelIntegrationCommand(
    ChannelType ChannelType,
    string ICalUrl,
    Guid RoomId
) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateChannelIntegrationValidation().Validate(this).ToFailure();
}

internal sealed class CreateChannelIntegrationValidation : AbstractValidator<CreateChannelIntegrationCommand>
{
    public CreateChannelIntegrationValidation()
    {
        RuleFor(x => x.ICalUrl)
            .NotEmpty().WithMessage("iCal URL é obrigatória.")
            .Must(BeValidHttpsUrl).WithMessage("iCal URL deve ser uma URL HTTPS válida.");

        RuleFor(x => x.RoomId)
            .NotEmpty().WithMessage("Quarto é obrigatório.");

        RuleFor(x => x.ChannelType)
            .IsInEnum().WithMessage("Tipo de canal inválido.");
    }

    private static bool BeValidHttpsUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }
}