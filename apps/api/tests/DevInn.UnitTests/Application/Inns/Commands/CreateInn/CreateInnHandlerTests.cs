using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Features.Inns.Commands.CreateInn;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Inns.Commands.CreateInn;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class CreateInnHandlerTests
{
    private readonly IInnRepository _innRepository = Substitute.For<IInnRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly CreateInnHandler _sut;

    public CreateInnHandlerTests()
    {
        _sut = new CreateInnHandler(_innRepository, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenInputIsInvalid()
    {
        var command = new CreateInnCommand("", "addr", "city", "BR", "SP", "1234","1199", "invalid-email");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldCreateInnAndCommit_WhenInputIsValid()
    {
        var command = new CreateInnCommand(
            "Pousada Azul",
            "Rua A, 10",
            "São Paulo",
            "Brasil",
            "SP",
            "37928000",
            "11999999999",
            "contato@pousada.com");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _innRepository.Received(1).AddAsync(Arg.Any<Inn>(), TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}