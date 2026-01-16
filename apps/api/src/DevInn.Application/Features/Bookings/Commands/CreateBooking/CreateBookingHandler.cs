using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.CreateBooking;

internal sealed class CreateBookingHandler(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IBookingRepository bookingRepository,
    IUnitOfWork uow) : ICommandHandler<CreateBookingCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateBookingCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(command.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        var category = await categoryRepository.GetByIdAsync(room.CategoryId, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria do quarto não encontrada"));

        // Capacity validation (adults + children) vs category max capacity
        var totalPersons = command.Adults + command.Children;
        if (totalPersons > category.MaxCapacity)
            return Result.Fail(new ConflictError("Número de hóspedes excede a capacidade do quarto."));

        // Map value objects
        var guest = new Guest(
            command.GuestName,
            command.Phone,
            command.Email,
            command.Document,
            command.BirthDate);

        var stay = new StayPeriod(command.CheckIn, command.CheckOut);
        var occupancy = new Occupancy(command.Adults, command.Children, command.ChildrenAges);

        // Availability check to prevent overbooking
        var hasConflict = await bookingRepository.HasOverlappingAsync(room.Id, stay.CheckIn, stay.CheckOut, cancellationToken);
        if (hasConflict)
            return Result.Fail(new ConflictError("O quarto não está disponível nas datas solicitadas."));

        // Price calculation based on PRD: (Base + AdultsExtra * ExtraPrice + SumChildrenPrice) * nights
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
                        continue; // free
                    case <= 10:
                        childrenTotalPerNight += category.ExtraPersonPrice * 0.5m; // 50% of extra person
                        break;
                    default:
                        childrenTotalPerNight += category.ExtraPersonPrice; // full value
                        break;
                }
            }
        }

        var perNight = category.BasePrice + adultExtraTotal + childrenTotalPerNight;
        var total = perNight * nights;

        var booking = new Booking(
            room.Id,
            guest,
            stay,
            occupancy,
            new Money(decimal.Round(total, 2)),
            new Money(0m),
            command.Source,
            command.Notes);

        // Note: Availability/conflict checks across reservations should be performed at application layer using repository queries.
        await bookingRepository.AddAsync(booking, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(booking.Id);
    }
}