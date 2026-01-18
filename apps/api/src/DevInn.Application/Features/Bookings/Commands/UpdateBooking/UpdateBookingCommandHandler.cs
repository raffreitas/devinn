using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.UpdateBooking;

internal sealed class UpdateBookingCommandHandler(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IBookingRepository bookingRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateBookingCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateBookingCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var booking = await bookingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (booking is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada"));

        var room = await roomRepository.GetByIdAsync(command.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        var category = await categoryRepository.GetByIdAsync(room.CategoryId, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria do quarto não encontrada"));

        if (booking.Status != BookingStatus.Scheduled)
            return Result.Fail(new ValidationError("Somente reservas em estado agendado podem ser alteradas."));

        var totalPersons = command.Adults + command.Children;
        if (totalPersons > category.MaxCapacity)
            return Result.Fail(new ConflictError("Número de hóspedes excede a capacidade do quarto."));

        var stay = new StayPeriod(command.CheckIn, command.CheckOut);
        var occupancy = new Occupancy(command.Adults, command.Children, command.ChildrenAges);

        var hasConflict = await bookingRepository.HasOverlappingAsync(command.RoomId, stay.CheckIn, stay.CheckOut,
            excludeBookingId: booking.Id, cancellationToken: cancellationToken);
        if (hasConflict)
            return Result.Fail(new ConflictError("O quarto não está disponível nas datas solicitadas."));

        var nights = stay.TotalNights();
        decimal extraAdults = Math.Max(0, command.Adults - 2);
        decimal adultExtraTotal = extraAdults * category.ExtraPersonPrice;

        decimal childrenTotalPerNight = 0;
        if (command.ChildrenAges != null)
        {
            foreach (var age in command.ChildrenAges)
            {
                switch (age)
                {
                    case <= 4:
                        continue;
                    case <= 10:
                        childrenTotalPerNight += category.ExtraPersonPrice * 0.5m;
                        break;
                    default:
                        childrenTotalPerNight += category.ExtraPersonPrice;
                        break;
                }
            }
        }

        var perNight = category.BasePrice + adultExtraTotal + childrenTotalPerNight;
        var total = perNight * nights;

        var guest = new Guest(
            command.Guest.Name,
            command.Guest.Phone,
            command.Guest.Email,
            command.Guest.Document,
            command.Guest.BirthDate);

        booking.Update(
            command.RoomId,
            guest,
            stay,
            occupancy,
            new Money(decimal.Round(total, 2)),
            command.Source,
            command.Notes);

        // Add payment if provided
        if (command is { PaidAmount: not null, PaymentMethod: not null })
        {
            booking.AddPayment(
                new Money(command.PaidAmount.Value),
                command.PaymentMethod.Value,
                DateTimeOffset.UtcNow,
                command.PaymentNotes);
        }

        await uow.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}