using DevInn.Application.Features.Inventory.RoomCategories.CreateRoomCategory;
using DevInn.Application.Features.Inventory.RoomCategories.DeleteRoomCategory;
using DevInn.Application.Features.Inventory.RoomCategories.GetRoomCategories;
using DevInn.Application.Features.Inventory.RoomCategories.UpdateRoomCategory;
using Microsoft.Extensions.DependencyInjection;

namespace DevInn.Application.Features.Inventory.RoomCategories;

public static class RoomCategoryFeature
{
    public static IServiceCollection AddRoomCategoryFeature(this IServiceCollection services)
    {
        services.AddScoped<ICreateRoomCategoryUseCase, CreateRoomCategoryUseCase>();
        services.AddScoped<IGetRoomCategoriesUseCase, GetRoomCategoriesUseCase>();
        services.AddScoped<IUpdateRoomCategoryUseCase, UpdateRoomCategoryUseCase>();
        services.AddScoped<IDeleteRoomCategoryUseCase, DeleteRoomCategoryUseCase>();
        return services;
    }
}
