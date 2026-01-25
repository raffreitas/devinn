using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.DeleteBooking;

public sealed record DeleteBookingCommand(Guid Id) : ICommand<Result>;

internal sealed class DeleteBookingValidator : AbstractValidator<DeleteBookingCommand>
{
    public DeleteBookingValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("O ID da reserva é obrigatória.");
    }
}