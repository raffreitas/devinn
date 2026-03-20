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
    IPricingCalculatorService pricingCalculatorService,
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
        Guest? guest = null;
        if (command.Guest is not null)
        {
            guest = new Guest(
                command.Guest.Name,
                command.Guest.Phone,
                command.Guest.Email,
                command.Guest.Document,
                command.Guest.BirthDate);
        }

        var stay = new StayPeriod(command.CheckIn, command.CheckOut);
        var occupancy = new Occupancy(command.Adults, command.Children, command.ChildrenAges);

        // Availability check to prevent overbooking
        var hasConflict = await bookingRepository.HasOverlappingAsync(room.Id, stay.CheckIn, stay.CheckOut,
            cancellationToken: cancellationToken);
        if (hasConflict)
            return Result.Fail(new ConflictError("O quarto não está disponível nas datas solicitadas."));

        // Calculate price using domain service (single source of truth)
        var breakdown = pricingCalculatorService.CalculateBreakdown(stay, category, occupancy);
        var total = breakdown.Total.Value;

        var booking = new Booking(
            room.Id,
            guest,
            stay,
            occupancy,
            total,
            command.Source,
            command.Notes);

        // Add initial payment if provided
        if (command is { PaidAmount: > 0, PaymentMethod: not null })
        {
            booking.AddPayment(
                new Money(command.PaidAmount.Value),
                command.PaymentMethod.Value,
                DateTimeOffset.UtcNow,
                command.PaymentNotes);
        }

        await bookingRepository.AddAsync(booking, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result.Ok(booking.Id);
    }
}