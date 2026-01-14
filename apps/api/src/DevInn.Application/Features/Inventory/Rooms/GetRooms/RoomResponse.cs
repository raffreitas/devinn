namespace DevInn.Application.Features.Inventory.Rooms.GetRooms;

public sealed record RoomResponse(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    int Number,
    string Name,
    string Status
);