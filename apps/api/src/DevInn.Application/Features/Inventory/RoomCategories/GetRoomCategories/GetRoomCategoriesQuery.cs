using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.RoomCategories.GetRoomCategories;

public sealed record GetRoomCategoriesQuery : IQuery<Result<RoomCategoryResponse[]>>;