using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Features.Auth.Commands.ForgotPassword;

using FluentResults;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.ForgotPassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ForgotPasswordHandlerTests
{
    private readonly IIdentityGateway _identityService = Substitute.For<IIdentityGateway>();

    private readonly ForgotPasswordHandler _sut;

    public ForgotPasswordHandlerTests()
    {
        _sut = new ForgotPasswordHandler(_identityService);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new ForgotPasswordCommand("");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenAspNetIdentityGatewayFails()
    {
        var command = new ForgotPasswordCommand("user@test.com");
        _identityService.RequestPasswordResetAsync(
                Arg.Any<ForgotPasswordRequest>(),
                TestContext.Current.CancellationToken)
            .Returns(Result.Fail("Falha ao enviar email de recuperação."));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].Message.ShouldBe("Falha ao enviar email de recuperação.");
    }

    [Fact]
    public async Task Handle_ShouldPassEmailToAspNetIdentityGateway()
    {
        var command = new ForgotPasswordCommand("user@test.com");
        _identityService.RequestPasswordResetAsync(
                Arg.Any<ForgotPasswordRequest>(),
                TestContext.Current.CancellationToken)
            .Returns(Result.Ok());

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        await _identityService.Received(1).RequestPasswordResetAsync(
            Arg.Is<ForgotPasswordRequest>(request => request.Email == command.Email),
            TestContext.Current.CancellationToken);
    }
}