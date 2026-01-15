using DevInn.Domain.Aggregates.Inventory.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.RoomCategories.GetRoomCategories;

internal sealed class GetRoomCategoriesHandler(IRoomCategoryRepository categoryRepository)
    : IQueryHandler<GetRoomCategoriesQuery, Result<RoomCategoryResponse[]>>
{
    public async ValueTask<Result<RoomCategoryResponse[]>> Handle(GetRoomCategoriesQuery query,
        CancellationToken cancellationToken)
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