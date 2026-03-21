using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Auth.Commands.ChangePassword;

using FluentResults;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.ChangePassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ChangePasswordHandlerTests
{
    private readonly IIdentityService _identityService = Substitute.For<IIdentityService>();
    private readonly IUserContext _userContext = Substitute.For<IUserContext>();

    private readonly ChangePasswordHandler _sut;

    public ChangePasswordHandlerTests()
    {
        _sut = new ChangePasswordHandler(_identityService, _userContext);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new ChangePasswordCommand("", "123");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenIdentityServiceFails()
    {
        var userId = Guid.NewGuid();
        var command = new ChangePasswordCommand("123456", "654321");
        _userContext.UserId.Returns(userId);
        _identityService.ChangePasswordAsync(Arg.Any<ChangePasswordRequest>(), TestContext.Current.CancellationToken)
            .Returns(Result.Fail("Falha ao alterar senha."));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].Message.ShouldBe("Falha ao alterar senha.");
    }

    [Fact]
    public async Task Handle_ShouldPassCurrentUserIdAndPasswordsToIdentityService()
    {
        var userId = Guid.NewGuid();
        var command = new ChangePasswordCommand("123456", "654321");
        _userContext.UserId.Returns(userId);
        _identityService.ChangePasswordAsync(Arg.Any<ChangePasswordRequest>(), TestContext.Current.CancellationToken)
            .Returns(Result.Ok());

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _identityService.Received(1).ChangePasswordAsync(
            Arg.Is<ChangePasswordRequest>(request =>
                request.UserId == userId &&
                request.CurrentPassword == command.CurrentPassword &&
                request.NewPassword == command.NewPassword),
            TestContext.Current.CancellationToken);
    }
}
