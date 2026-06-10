using DevInn.Application.Common.Pagination;
using DevInn.Application.Features.Bookings.Shared;
using DevInn.Domain.Aggregates.Bookings.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Bookings.Queries.ListBookings;

public record ListBookingsQuery(
    DateTimeOffset? StartDate,
    DateTimeOffset? EndDate,
    BookingStatus? Status,
    BookingReconciliationStatus? ReconciliationStatus,
    PaymentStatus? PaymentStatus,
    int PageNumber = 1,
    int PageSize = 50
) : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<BookingDto>>>;
