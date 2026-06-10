using DevInn.Application.Features.Bookings.Commands.UpdateBookingReconciliationStatus;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Bookings;

public sealed class UpdateBookingReconciliationStatusEndpoint : IEndpoint
{
    private const string Route = "api/v1/bookings/{id:guid}/reconciliation-status";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch(Route, async (
                Guid id,
                UpdateBookingReconciliationStatusRequest request,
                ISender sender,
                CancellationToken ct) =>
            {
                var command = new UpdateBookingReconciliationStatusCommand(id, request.ReconciliationStatus);
                var result = await sender.Send(command, ct);
                return result.ToNoContent();
            })
            .WithTags(Tags.Bookings)
            .WithName("Update Booking Reconciliation Status")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }

    private sealed record UpdateBookingReconciliationStatusRequest(
        BookingReconciliationStatus ReconciliationStatus);
}
