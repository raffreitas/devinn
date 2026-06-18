using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Auth.Commands.UpdateProfile;

using FluentResults;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.UpdateProfile;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateProfileHandlerTests
{
    private readonly IIdentityGateway _identityService = Substitute.For<IIdentityGateway>();
    private readonly IUserContext _userContext = Substitute.For<IUserContext>();

    private readonly UpdateProfileHandler _sut;

    public UpdateProfileHandlerTests()
    {
        _sut = new UpdateProfileHandler(_identityService, _userContext);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new UpdateProfileCommand("");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenCurrentUserIsNotFound()
    {
        var userId = Guid.NewGuid();
        var command = new UpdateProfileCommand("Novo Nome");
        _userContext.UserId.Returns(userId);
        _identityService.GetUserByIdAsync(userId, TestContext.Current.CancellationToken)
            .Returns(Result.Fail<User>(new NotFoundError("Usuário não encontrado")));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].ShouldBeAssignableTo<NotFoundError>();
        result.Errors[0].Message.ShouldBe("Usuário não encontrado");
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenAspNetIdentityGatewayCannotUpdateProfile()
    {
        var userId = Guid.NewGuid();
        var existingUser = new User(userId, Guid.NewGuid(), "Nome Antigo", "user@test.com", [UserRole.InnAdmin]);
        var command = new UpdateProfileCommand("Novo Nome");
        _userContext.UserId.Returns(userId);
        _identityService.GetUserByIdAsync(userId, TestContext.Current.CancellationToken)
            .Returns(Result.Ok(existingUser));
        _identityService.UpdateProfileAsync(Arg.Any<User>(), TestContext.Current.CancellationToken)
            .Returns(Result.Fail("Falha ao atualizar o perfil."));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].Message.ShouldBe("Falha ao atualizar o perfil.");
    }

    [Fact]
    public async Task Handle_ShouldUpdateOnlyNameAndKeepExistingUserData()
    {
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var existingUser = new User(userId, tenantId, "Nome Antigo", "user@test.com", [UserRole.InnAdmin]);
        var command = new UpdateProfileCommand("Novo Nome");
        _userContext.UserId.Returns(userId);
        _identityService.GetUserByIdAsync(userId, TestContext.Current.CancellationToken)
            .Returns(Result.Ok(existingUser));
        _identityService.UpdateProfileAsync(Arg.Any<User>(), TestContext.Current.CancellationToken)
            .Returns(Result.Ok());

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _identityService.Received(1).UpdateProfileAsync(
            Arg.Is<User>(user =>
                user.Id == userId &&
                user.TenantId == tenantId &&
                user.Name == command.Name &&
                user.Email == existingUser.Email &&
                user.Roles.SequenceEqual(existingUser.Roles)),
            TestContext.Current.CancellationToken);
    }
}