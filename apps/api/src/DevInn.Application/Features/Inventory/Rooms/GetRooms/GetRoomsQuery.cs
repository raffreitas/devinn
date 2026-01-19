using DevInn.Application.Common.Pagination;
using DevInn.Domain.Aggregates.Inventory.Enums;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public sealed record GetRoomsQuery(
    Guid? CategoryId,
    RoomStatus? Status,
    int PageNumber = 1,
    int PageSize = 20
) : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<RoomResponse>>>;