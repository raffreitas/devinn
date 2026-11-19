using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Tokens;
using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Application.Features.Auth.Commands.Login;

using FluentResults;

using NSubstitute;
using NSubstitute.ExceptionExtensions;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.Login;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class LoginHandlerTests
{
    private static readonly DateTimeOffset LoginTime = new(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);
    private readonly IIdentityGateway _identityService = Substitute.For<IIdentityGateway>();
    private readonly IAccessTokenProvider _tokenService = Substitute.For<IAccessTokenProvider>();

    private readonly LoginHandler _sut;

    public LoginHandlerTests()
    {
        var timeProvider = Substitute.For<TimeProvider>();
        timeProvider.GetUtcNow().Returns(LoginTime);
        _sut = new LoginHandler(_identityService, _tokenService, timeProvider);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidationError_WhenCommandIsInvalid()
    {
        var command = new LoginCommand("", "");

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        await _identityService.DidNotReceiveWithAnyArgs()
            .RecordSuccessfulLoginAsync(default, default, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnUnauthorized_WhenIdentityLoginFails()
    {
        var command = new LoginCommand("user@test.com", "123456");
        _identityService.LoginAsync(command.Email, command.Password, TestContext.Current.CancellationToken)
            .Returns(Result.Fail<User>("invalid"));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsFailed.ShouldBeTrue();
        result.Errors.ShouldHaveSingleItem();
        result.Errors[0].Message.ShouldBe("Credenciais inválidas");
        await _identityService.DidNotReceiveWithAnyArgs()
            .RecordSuccessfulLoginAsync(default, default, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Handle_ShouldReturnToken_WhenCredentialsAreValid()
    {
        var command = new LoginCommand("user@test.com", "123456");
        var user = new User(Guid.NewGuid(), Guid.NewGuid(), "User", command.Email, [UserRole.InnAdmin],
            "security-stamp");
        _identityService.LoginAsync(command.Email, command.Password, TestContext.Current.CancellationToken)
            .Returns(Result.Ok(user));
        _tokenService.GenerateTokenAsync(Arg.Any<TokenRequest>(), TestContext.Current.CancellationToken)
            .Returns(new TokenResponse("jwt-token", DateTime.UtcNow.AddHours(1)));

        var result = await _sut.Handle(command, TestContext.Current.CancellationToken);

        result.IsSuccess.ShouldBeTrue();
        result.Value.AccessToken.ShouldBe("jwt-token");
        await _tokenService.Received(1).GenerateTokenAsync(
            Arg.Is<TokenRequest>(request =>
                request.UserId == user.Id &&
                request.TenantId == user.TenantId &&
                request.Email == user.Email &&
                request.SecurityStamp == user.SecurityStamp &&
                request.Roles.SequenceEqual(user.Roles.Select(role => role.ToString()))),
            TestContext.Current.CancellationToken);
        Received.InOrder(() =>
        {
            _ = _tokenService.GenerateTokenAsync(Arg.Any<TokenRequest>(), TestContext.Current.CancellationToken);
            _ = _identityService.RecordSuccessfulLoginAsync(user.Id, LoginTime, TestContext.Current.CancellationToken);
        });
    }

    [Fact]
    public async Task Handle_ShouldNotRecordLogin_WhenTokenGenerationFails()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var command = new LoginCommand("user@test.com", "123456");
        var user = new User(Guid.NewGuid(), Guid.NewGuid(), "User", command.Email, [UserRole.InnAdmin],
            "security-stamp");
        _identityService.LoginAsync(command.Email, command.Password, cancellationToken).Returns(Result.Ok(user));
        _tokenService.GenerateTokenAsync(Arg.Any<TokenRequest>(), cancellationToken)
            .ThrowsAsync<InvalidOperationException>();

        await Should.ThrowAsync<InvalidOperationException>(() => _sut.Handle(command, cancellationToken).AsTask());

        await _identityService.DidNotReceiveWithAnyArgs()
            .RecordSuccessfulLoginAsync(default, default, cancellationToken);
    }
}