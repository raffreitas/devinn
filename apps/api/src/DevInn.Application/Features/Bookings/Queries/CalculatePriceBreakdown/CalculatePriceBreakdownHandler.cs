using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;

internal sealed class CalculatePriceBreakdownHandler(
    IRoomCategoryRepository roomCategoryRepository,
    IPricingCalculatorService pricingCalculatorService)
    : IQueryHandler<CalculatePriceBreakdownQuery, Result<PriceBreakdownDto>>
{
    public async ValueTask<Result<PriceBreakdownDto>> Handle(
        CalculatePriceBreakdownQuery query,
        CancellationToken cancellationToken)
    {
        var validation = query.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var roomCategory = await roomCategoryRepository.GetByIdAsync(query.RoomCategoryId, cancellationToken);
        if (roomCategory is null)
            return Result.Fail(new NotFoundError("Categoria de quarto não encontrada."));

        var stayPeriod = new StayPeriod(query.CheckIn, query.CheckOut);
        var occupancy = new Occupancy(query.Adults, query.Children, query.ChildrenAges);

        // Calcular breakdown usando serviço de domínio
        var breakdown = pricingCalculatorService.CalculateBreakdown(stayPeriod, roomCategory, occupancy);

        // Converter para DTO
        var dto = new PriceBreakdownDto(
            BasePrice: breakdown.BasePrice.Value,
            PerPersonPrice: breakdown.PerPersonPrice.Value,
            PayingUnits: breakdown.PayingUnits,
            ChildrenCost: breakdown.ChildrenCost.Value,
            DailyTotal: breakdown.DailyTotal.Value,
            Nights: breakdown.Nights,
            Total: breakdown.Total.Value
        );

        return Result.Ok(dto);
    }
}