namespace DevInn.Application.Features.Inventory.Queries.RoomCategories.GetRoomCategories;

public sealed record RoomCategoryResponse(
    Guid Id,
    string Name,
    int Capacity,
    string? Description,
    decimal BasePrice,
    decimal ExtraPersonPrice);
