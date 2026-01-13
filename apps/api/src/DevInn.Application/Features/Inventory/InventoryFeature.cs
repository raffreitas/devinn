using DevInn.Application.Features.Inventory.RoomCategories;
using DevInn.Application.Features.Inventory.Rooms;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application.Features.Inventory;

public static class InventoryFeature
{
    public static IServiceCollection AddInventoryFeature(this IServiceCollection services)
    {
        services.AddRoomCategoryFeature();
        services.AddRoomFeature();
        return services;
    }
}
