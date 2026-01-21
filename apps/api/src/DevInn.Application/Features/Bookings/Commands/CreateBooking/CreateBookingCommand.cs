using DevInn.Application.Common.Validation;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.CreateBooking;

public sealed record CreateBookingCommand(
    GuestDto Guest,
    Guid RoomId,
    DateTimeOffset CheckIn,
    DateTimeOffset CheckOut,
    int Adults,
    int Children,
    int[]? ChildrenAges = null,
    string? Notes = null,
    BookingSource Source = BookingSource.Manual,
    decimal? PaidAmount = null,
    PaymentMethod? PaymentMethod = null,
    string? PaymentNotes = null
) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateBookingInputValidation().Validate(this).ToFailure();
}

internal sealed class CreateBookingInputValidation : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingInputValidation()
    {
        RuleFor(command => command.Guest).NotNull().WithMessage("Informações do hóspede são obrigatórias.");
        RuleFor(command => command.Guest).SetValidator(new GuestDtoValidation());

        RuleFor(x => x.RoomId)
            .NotEmpty().WithMessage("Quarto é obrigatório.");

        RuleFor(x => x.CheckIn)
            .GreaterThanOrEqualTo(DateTimeOffset.UtcNow.Date)
            .WithMessage("Data de check-in não pode ser no passado.")
            .LessThan(x => x.CheckOut)
            .WithMessage("Data de check-in deve ser anterior à data de check-out.");

        RuleFor(x => x.CheckOut)
            .GreaterThan(x => x.CheckIn)
            .WithMessage("Data de check-out deve ser posterior à data de check-in.");

        RuleFor(x => x.Adults)
            .GreaterThanOrEqualTo(1).WithMessage("Deve haver pelo menos 1 adulto.");

        RuleFor(x => x.Children)
            .GreaterThanOrEqualTo(0).WithMessage("Quantidade de crianças não pode ser negativa.");

        When(x => x.Children > 0, () =>
        {
            RuleFor(x => x.ChildrenAges)
                .NotNull().WithMessage("Idades das crianças devem ser informadas quando houver crianças.")
                .Must((cmd, arr) => arr != null && arr.Length == cmd.Children)
                .WithMessage("Número de idades deve corresponder à quantidade de crianças.");
        });

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Observações não podem exceder 1000 caracteres.");

        When(x => x.PaidAmount.HasValue, () =>
        {
            RuleFor(x => x.PaidAmount!.Value)
                .GreaterThan(0).WithMessage("Valor do pagamento deve ser maior que zero.");

            RuleFor(x => x.PaymentMethod)
                .NotNull().WithMessage("Método de pagamento é obrigatório quando há valor pago.");
        });

        RuleFor(x => x.PaymentNotes)
            .MaximumLength(500).WithMessage("Observações do pagamento não podem exceder 500 caracteres.");
    }
}

internal sealed class GuestDtoValidation : AbstractValidator<GuestDto>
{
    public GuestDtoValidation()
    {
        RuleFor(guest => guest.Name)
            .NotEmpty().WithMessage("Nome do hóspede é obrigatório.")
            .MaximumLength(200).WithMessage("Nome do hóspede deve ter no máximo 200 caracteres.");

        RuleFor(guest => guest.Phone)
            .NotEmpty().WithMessage("Telefone é obrigatório.")
            .MaximumLength(15).WithMessage("Telefone deve ter no máximo 15 caracteres.");

        When(guest => !string.IsNullOrWhiteSpace(guest.Email), () =>
        {
            RuleFor(guest => guest.Email).EmailAddress().WithMessage("Email inválido.")
                .MaximumLength(100).WithMessage("Email deve ter no máximo 100 caracteres.");
        });

        RuleFor(guest => guest.BirthDate)
            .LessThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .When(guest => guest.BirthDate.HasValue)
            .WithMessage("Data de nascimento inválida.");

    }
}