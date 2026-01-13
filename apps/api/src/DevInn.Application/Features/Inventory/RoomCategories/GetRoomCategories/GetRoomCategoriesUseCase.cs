using DevInn.Application.Common.Abstractions;
using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

namespace DevInn.Application.Features.Inventory.RoomCategories.GetRoomCategories;

public interface IGetRoomCategoriesUseCase : IUseCase<GetRoomCategoriesInput, Result<RoomCategoryResponse[]>>;

internal sealed class GetRoomCategoriesUseCase(IRoomCategoryRepository categoryRepository) : IGetRoomCategoriesUseCase
{
    public async ValueTask<Result<RoomCategoryResponse[]>> ExecuteAsync(
        GetRoomCategoriesInput input,
        CancellationToken cancellationToken = default)
    {
        var categories = await categoryRepository.GetAllAsync(cancellationToken);

        var response = categories
            .Select(c => new RoomCategoryResponse(
                c.Id,
                c.Name,
                c.MaxCapacity,
                c.Description,
                c.BasePrice,
                c.ExtraPersonPrice))
            .ToArray();

        return Result.Ok(response);
    }
}