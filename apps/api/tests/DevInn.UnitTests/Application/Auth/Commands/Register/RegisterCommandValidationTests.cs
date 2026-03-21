using DevInn.Application.Common.Identity;
using DevInn.Application.Features.Auth.Commands.Register;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.Register;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class RegisterCommandValidationTests
{
    [Fact]
    public void Validate_ShouldReturnFailure_WhenPasswordHasLessThanEightCharacters()
    {
        var command = CreateValidCommand() with { Password = "Ab1!" };

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldContain(error => error.Field == "Password"
            && error.Message == "A senha deve ter no mínimo 8 caracteres.");
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenPasswordHasNoNonAlphanumericCharacter()
    {
        var command = CreateValidCommand() with { Password = "Abcdef12" };

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldContain(error => error.Field == "Password"
            && error.Message == "A senha deve conter pelo menos um caractere não alfanumérico.");
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenPasswordHasNoDigit()
    {
        var command = CreateValidCommand() with { Password = "Abcdefg!" };

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldContain(error => error.Field == "Password"
            && error.Message == "A senha deve conter pelo menos um número.");
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenPasswordHasNoUppercaseLetter()
    {
        var command = CreateValidCommand() with { Password = "abcdef1!" };

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldContain(error => error.Field == "Password"
            && error.Message == "A senha deve conter pelo menos uma letra maiúscula.");
    }

    [Fact]
    public void Validate_ShouldReturnSuccess_WhenPasswordMatchesPolicy()
    {
        var command = CreateValidCommand();

        var validation = command.Validate();

        validation.IsFailure.ShouldBeFalse();
        validation.Errors.ShouldBeEmpty();
    }

    private static RegisterCommand CreateValidCommand()
    {
        return new RegisterCommand(
            Name: "Usuário Teste",
            Email: "usuario@test.com",
            Password: "Abcdef1!",
            InnId: Guid.NewGuid(),
            Role: UserRole.InnAdmin);
    }
}