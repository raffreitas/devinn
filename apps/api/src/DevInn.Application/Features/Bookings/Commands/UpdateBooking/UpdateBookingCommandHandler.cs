using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Enums;
using DevInn.Domain.Shared.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Commands.UpdateBooking;

internal sealed class UpdateBookingCommandHandler(
    IRoomRepository roomRepository,
    IRoomCategoryRepository categoryRepository,
    IBookingRepository bookingRepository,
    IPricingCalculatorService pricingCalculatorService,
    IUnitOfWork uow) : ICommandHandler<UpdateBookingCommand, Result>
{
    private const int CurrencyDecimalPlaces = 2;

    public async ValueTask<Result> Handle(UpdateBookingCommand command, CancellationToken cancellationToken)
    {
        var booking = await bookingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (booking is null)
            return Result.Fail(new NotFoundError("Reserva não encontrada"));

        if (booking.IsBlock)
            return await EnrichICalBlock(booking, command, cancellationToken);

        return await UpdateRegularBooking(booking, command, cancellationToken);
    }

    private async ValueTask<Result> EnrichICalBlock(
        Booking booking,
        UpdateBookingCommand command,
        CancellationToken cancellationToken)
    {
        if (command.Guest is null)
            return Result.Fail(
                new ValidationError("Dados do hóspede são obrigatórios para enriquecimento do bloqueio."));

        var room = await roomRepository.GetByIdAsync(booking.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        if (room.Status != RoomStatus.Active)
            return Result.Fail(new ConflictError("O quarto selecionado não está disponível para reserva."));

        var category = await categoryRepository.GetByIdAsync(room.CategoryId, cancellationToken);
        if (category is null)
            return Result.Fail(new NotFoundError("Categoria do quarto não encontrada"));

        var occupancy = new Occupancy(command.Adults, command.Children, command.ChildrenAges);
        var breakdown = pricingCalculatorService.CalculateBreakdown(booking.StayPeriod, category, occupancy);

        var guest = new Guest(
            command.Guest.Name,
            command.Guest.Phone,
            command.Guest.Email,
            command.Guest.Document,
            command.Guest.BirthDate);

        booking.Enrich(
            guest,
            occupancy,
            command.Notes,
            new Money(decimal.Round(breakdown.Total.Value, CurrencyDecimalPlaces))
        );

        if (command is { PaidAmount: > 0, PaymentMethod: not null })
        {
            booking.ClearPayments();
            booking.AddPayment(
                new Money(command.PaidAmount.Value),
                command.PaymentMethod.Value,
                DateTimeOffset.UtcNow,
                command.PaymentNotes);
        }

        await uow.CommitAsync(cancellationToken);
        return Result.Ok();
    }

    private async ValueTask<Result> UpdateRegularBooking(
        Booking booking,
        UpdateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var room = await roomRepository.GetByIdAsync(command.RoomId, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Quarto não encontrado"));

        if (room.Status != RoomStatus.Active)
            return Result.Fail(new ConflictError("O quarto selecionado não está disponível para reserva."));

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

        var breakdown = pricingCalculatorService.CalculateBreakdown(stay, category, occupancy);
        var total = breakdown.Total.Value;

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

        booking.Update(
            command.RoomId,
            guest,
            stay,
            occupancy,
            new Money(decimal.Round(total, CurrencyDecimalPlaces)),
            command.Source,
            command.Notes);

        if (command is { PaidAmount: not null, PaymentMethod: not null })
        {
            booking.ClearPayments();
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