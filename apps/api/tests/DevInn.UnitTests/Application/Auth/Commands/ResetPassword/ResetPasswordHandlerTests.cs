using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Auth.Commands.ResetPassword;

using FluentResults;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.ResetPassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ResetPasswordHandlerTests
{
    private readonly IIdentityService _identityService = Substitute.For<IIdentityService>();

    private readonly ResetPasswordHandler _sut;

    public ResetPasswordHandlerTests()
    {
        _sut = new ResetPasswordHandler(_identityService);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new ResetPasswordCommand(Guid.Empty, "", "123");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenIdentityServiceFails()
    {
        var command = new ResetPasswordCommand(Guid.NewGuid(), "token", "Strong123!");
        _identityService.ResetPasswordAsync(Arg.Any<ResetPasswordRequest>(), TestContext.Current.CancellationToken)
            .Returns(Result.Fail("O link de redefinição é inválido ou expirou."));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].Message.ShouldBe("O link de redefinição é inválido ou expirou.");
    }

    [Fact]
    public async Task Handle_ShouldPassResetPayloadToIdentityService()
    {
        var command = new ResetPasswordCommand(Guid.NewGuid(), "token", "Strong123!");
        _identityService.ResetPasswordAsync(Arg.Any<ResetPasswordRequest>(), TestContext.Current.CancellationToken)
            .Returns(Result.Ok());

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _identityService.Received(1).ResetPasswordAsync(
            Arg.Is<ResetPasswordRequest>(request =>
                request.UserId == command.UserId &&
                request.Token == command.Token &&
                request.NewPassword == command.NewPassword),
            TestContext.Current.CancellationToken);
    }
}