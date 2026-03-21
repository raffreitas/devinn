using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Inns.Commands.UpdateInn;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Inns.Commands.UpdateInn;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateInnHandlerTests
{
    private readonly IInnRepository _innRepository = Substitute.For<IInnRepository>();
    private readonly ITenantContext _tenantContext = Substitute.For<ITenantContext>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private readonly UpdateInnHandler _sut;

    public UpdateInnHandlerTests()
    {
        _sut = new UpdateInnHandler(_innRepository, _tenantContext, _uow);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new UpdateInnCommand(Guid.Empty, "", "Rua A", "São Paulo", "Brasil", "SP", "12345", "1199", "email-invalido");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenCommandIdDoesNotMatchTenant()
    {
        var tenantId = Guid.NewGuid();
        _tenantContext.Tenant.Returns(new Tenant(tenantId));

        var command = new UpdateInnCommand(
            Guid.NewGuid(),
            "Pousada Azul",
            "Rua A, 10",
            "São Paulo",
            "Brasil",
            "SP",
            "37928000",
            "11999999999",
            "contato@pousada.com");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
    }

    [Fact]
    public async Task Handle_ShouldUpdateInnAndCommit_WhenCommandIsValid()
    {
        var inn = new Inn(
            "Pousada Antiga",
            "Rua Antiga, 1",
            "Campinas",
            "Brasil",
            "SP",
            "13000000",
            "1133334444",
            "antigo@pousada.com");

        var tenantId = inn.Id;
        _tenantContext.Tenant.Returns(new Tenant(tenantId));

        _innRepository.GetByIdAsync(tenantId, TestContext.Current.CancellationToken)
            .Returns(inn);

        var command = new UpdateInnCommand(
            tenantId,
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
        inn.Name.ShouldBe(command.Name);
        inn.Address.ShouldBe(command.Address);
        inn.City.ShouldBe(command.City);
        inn.Country.ShouldBe(command.Country);
        inn.State.ShouldBe(command.State);
        inn.ZipCode.ShouldBe(command.ZipCode);
        inn.Phone.ShouldBe(command.Phone);
        inn.Email.ShouldBe(command.Email);
        await _innRepository.Received(1).UpdateAsync(inn, TestContext.Current.CancellationToken);
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }
}
