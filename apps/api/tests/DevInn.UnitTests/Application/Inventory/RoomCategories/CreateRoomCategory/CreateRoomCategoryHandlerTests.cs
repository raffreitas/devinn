using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Features.Inventory.Commands.RoomCategories.CreateRoomCategory;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.Abstractions;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;

using NSubstitute;
using NSubstitute.ReturnsExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Inventory.RoomCategories.CreateRoomCategory;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateRoomCategoryHandlerTests
{
    private readonly IRoomCategoryRepository _categoryRepository = Substitute.For<IRoomCategoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateRoomCategoryHandler _sut;

    public CreateRoomCategoryHandlerTests()
    {
        _sut = new CreateRoomCategoryHandler(_categoryRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenCategoryNameAlreadyExists()
    {
        var command = new CreateRoomCategoryCommand("Luxo", 2, "Desc", 100m, 20m);
        _categoryRepository.GetByNameAsync(command.Name, TestContext.Current.CancellationToken)
            .Returns(new RoomCategory("Luxo", "Desc", 2, new PricingPolicy(100m, 20m)));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].ShouldBeAssignableTo<ConflictError>();
    }

    [Fact]
    public async Task Handle_ShouldCreateCategoryAndCommit_WhenCommandIsValid()
    {
        var command = new CreateRoomCategoryCommand("Luxo", 2, "Desc", 100m, 20m);
        _categoryRepository.GetByNameAsync(command.Name, TestContext.Current.CancellationToken).ReturnsNull();

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _categoryRepository.Received(1).AddAsync(Arg.Any<RoomCategory>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}
