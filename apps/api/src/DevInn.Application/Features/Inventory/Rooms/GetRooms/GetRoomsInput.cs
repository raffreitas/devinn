using DevInn.Application.Common.Pagination;

namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public sealed record GetRoomsInput(int PageNumber = 1, int PageSize = 20) : PaginationInput(PageNumber, PageSize);