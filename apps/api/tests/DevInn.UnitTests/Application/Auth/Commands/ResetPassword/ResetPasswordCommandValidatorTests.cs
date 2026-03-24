using DevInn.Application.Features.Auth.Commands.ResetPassword;

using FluentValidation.TestHelper;

namespace DevInn.UnitTests.Application.Auth.Commands.ResetPassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ResetPasswordCommandValidatorTests
{
    private readonly ResetPasswordCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldReturnFailure_WhenUserIdIsEmpty()
    {
        var command = new ResetPasswordCommand(Guid.Empty, "token", "Strong123!");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.UserId);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenTokenIsEmpty()
    {
        var command = new ResetPasswordCommand(Guid.NewGuid(), "", "Strong123!");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Token);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenNewPasswordIsTooShort()
    {
        var command = new ResetPasswordCommand(Guid.NewGuid(), "token", "Ab1!");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Validate_ShouldReturnSuccess_WhenCommandIsValid()
    {
        var command = new ResetPasswordCommand(Guid.NewGuid(), "token", "Strong123!");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}