using DevInn.Application.Features.Auth.Commands.ForgotPassword;

using FluentValidation.TestHelper;

namespace DevInn.UnitTests.Application.Auth.Commands.ForgotPassword;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ForgotPasswordCommandValidationTests
{
    private readonly ForgotPasswordCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldReturnFailure_WhenEmailIsEmpty()
    {
        var command = new ForgotPasswordCommand("");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenEmailIsInvalid()
    {
        var command = new ForgotPasswordCommand("invalid-email");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Validate_ShouldReturnSuccess_WhenCommandIsValid()
    {
        var command = new ForgotPasswordCommand("usuario@test.com");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}