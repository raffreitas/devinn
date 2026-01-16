namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public sealed record RoomResponse(
    Guid Id,
    int Number,
    string? Name,
    string Status,
    Guid CategoryId,
    string CategoryName,
    int Capacity,
    decimal BasePrice,
    decimal ExtraGuestPrice
);