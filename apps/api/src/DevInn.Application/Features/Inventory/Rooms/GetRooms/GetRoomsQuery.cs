using DevInn.Application.Common.Pagination;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public sealed record GetRoomsQuery(int PageNumber = 1, int PageSize = 20)
    : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<RoomResponse>>>;