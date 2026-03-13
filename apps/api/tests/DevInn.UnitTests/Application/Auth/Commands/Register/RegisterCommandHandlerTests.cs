using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Auth.Commands.Register;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.Register;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class RegisterCommandHandlerTests
{
    private readonly IIdentityService _identityService = Substitute.For<IIdentityService>();
    private readonly IInnRepository _innRepository = Substitute.For<IInnRepository>();

    private readonly RegisterCommandHandler _sut;

    public RegisterCommandHandlerTests()
    {
        _sut = new RegisterCommandHandler(_identityService, _innRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new RegisterCommand("", "invalid", "123", Guid.Empty, UserRole.InnAdmin);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenInnDoesNotExist()
    {
        var innId = Guid.NewGuid();
        var command = new RegisterCommand("User", "user@test.com", "123456", innId, UserRole.InnAdmin);
        _innRepository.ExistsAsync(innId, TestContext.Current.CancellationToken).Returns(false);

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors[0].Message.ShouldBe("A pousada especificada não existe");
    }

    [Fact]
    public async Task Handle_ShouldSucceed_WhenSuperAdminAndIdentityRegistersUser()
    {
        var command = new RegisterCommand("Admin", "admin@test.com", "123456", null, UserRole.SuperAdmin);
        _identityService.RegisterAsync(Arg.Any<RegisterUserRequest>(), TestContext.Current.CancellationToken)
            .Returns(Result.Ok(new User(Guid.NewGuid(), null, "Admin", command.Email, [UserRole.SuperAdmin])));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
    }
}