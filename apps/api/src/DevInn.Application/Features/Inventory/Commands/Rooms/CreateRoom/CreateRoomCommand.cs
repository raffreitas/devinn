using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Aggregates.Inventory.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inventory.Commands.Rooms.CreateRoom;

public sealed record CreateRoomIntegrationInput(
    ChannelType ChannelType,
    string ICalUrl);

public sealed record CreateRoomCommand(
    Guid CategoryId,
    int Number,
    string? Name,
    RoomStatus? Status,
    IReadOnlyList<CreateRoomIntegrationInput>? Integrations) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateRoomValidator().Validate(this).ToFailure();
};

public sealed class CreateRoomValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Number)
            .GreaterThan(0).WithMessage("Número do quarto deve ser maior que 0")
            .LessThanOrEqualTo(999).WithMessage("Número do quarto não pode exceder 999");

        When(x => x.Status != null, () =>
        {
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Status do quarto inválido");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name)
                .MaximumLength(100).WithMessage("Nome não pode ter mais de 100 caracteres");
        });

        When(x => x.Integrations != null && x.Integrations.Count > 0, () =>
        {
            RuleForEach(x => x.Integrations)
                .ChildRules(integration =>
                {
                    integration.RuleFor(x => x.ICalUrl)
                        .NotEmpty().WithMessage("iCal URL é obrigatória.")
                        .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps)
                        .WithMessage("iCal URL deve ser uma URL HTTPS válida.");

                    integration.RuleFor(x => x.ChannelType)
                        .IsInEnum().WithMessage("Tipo de canal inválido.");
                });
        });
    }
}
