using DevInn.Application.Features.Auth.Commands.ChangePassword;

using FluentValidation.TestHelper;

namespace DevInn.UnitTests.Application.Auth.Commands.ChangePassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ChangePasswordCommandValidatorTests
{
    private readonly ChangePasswordCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldReturnFailure_WhenCurrentPasswordIsEmpty()
    {
        var command = new ChangePasswordCommand("", "123456");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CurrentPassword);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenNewPasswordIsEmpty()
    {
        var command = new ChangePasswordCommand("123456", "");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenNewPasswordIsTooShort()
    {
        var command = new ChangePasswordCommand("123456", "123");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenNewPasswordMatchesCurrentPassword()
    {
        var command = new ChangePasswordCommand("123456", "123456");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Validate_ShouldReturnSuccess_WhenCommandIsValid()
    {
        var command = new ChangePasswordCommand("123456", "654321");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
