using DevInn.Application.Common.Validation;
using DevInn.Application.Features.Bookings.Commands.CreateBooking;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Shared.Enums;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.UpdateBooking;

public sealed record UpdateBookingCommand(
    Guid Id,
    GuestDto? Guest,
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
) : ICommand<Result>
{
    public Validation Validate() => new UpdateBookingCommandValidator().Validate(this).ToFailure();
}

internal sealed class UpdateBookingCommandValidator : AbstractValidator<UpdateBookingCommand>
{
    public UpdateBookingCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id da reserva é obrigatório.");

        When(x => x.Source == BookingSource.Manual, () =>
        {
            RuleFor(command => command.Guest).NotNull().WithMessage("Informações do hóspede são obrigatórias para reservas manuais.");
            RuleFor(command => command.Guest).SetValidator(new GuestDtoValidation()!);
        });

        When(x => x.Guest != null, () =>
        {
            RuleFor(command => command.Guest).SetValidator(new GuestDtoValidation()!);
        });

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