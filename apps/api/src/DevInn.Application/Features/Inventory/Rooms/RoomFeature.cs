using DevInn.Application.Features.Inventory.Rooms.CreateRoom;
using DevInn.Application.Features.Inventory.Rooms.DeleteRoom;
using DevInn.Application.Features.Inventory.Rooms.GetRooms;
using DevInn.Application.Features.Inventory.Rooms.UpdateRoom;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application.Features.Inventory.Rooms;

public static class RoomFeature
{
    public static IServiceCollection AddRoomFeature(this IServiceCollection services)
    {
        services.AddScoped<ICreateRoomUseCase, CreateRoomUseCase>();
        services.AddScoped<IGetRoomsUseCase, GetRoomsUseCase>();
        services.AddScoped<IUpdateRoomUseCase, UpdateRoomUseCase>();
        services.AddScoped<IDeleteRoomUseCase, DeleteRoomUseCase>();
        return services;
    }
}
