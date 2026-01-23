using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.CalculatePriceBreakdown;

public sealed record CalculatePriceBreakdownQuery(
    Guid RoomCategoryId,
    DateTimeOffset CheckIn,
    DateTimeOffset CheckOut,
    int Adults,
    int Children,
    int[] ChildrenAges) : IQuery<Result<PriceBreakdownDto>>
{
    public Validation Validate() => new CalculatePriceBreakdownValidator().Validate(this).ToFailure();
};

internal sealed class CalculatePriceBreakdownValidator : AbstractValidator<CalculatePriceBreakdownQuery>
{
    public CalculatePriceBreakdownValidator()
    {
        RuleFor(x => x.RoomCategoryId)
            .NotEmpty().WithMessage("O Id da categoria de quarto é obrigatório.");

        RuleFor(x => x.CheckIn)
            .LessThan(x => x.CheckOut)
            .WithMessage("A data de check-in deve ser menor que a de check-out.");

        RuleFor(x => x.Adults)
            .GreaterThan(0).WithMessage("Deve haver pelo menos um adulto na reserva.");

        RuleFor(x => x.Children)
            .GreaterThanOrEqualTo(0).WithMessage("O número de crianças não pode ser negativo.");

        RuleFor(x => x.ChildrenAges.Length)
            .Equal(x => x.Children)
            .WithMessage("A quantidade de idades não corresponde ao número de crianças.");
    }
}