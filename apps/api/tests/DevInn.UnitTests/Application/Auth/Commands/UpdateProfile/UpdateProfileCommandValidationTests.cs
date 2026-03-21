using DevInn.Application.Features.Auth.Commands.UpdateProfile;

using Shouldly;

namespace DevInn.UnitTests.Application.Auth.Commands.UpdateProfile;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class UpdateProfileCommandValidationTests
{
    [Fact]
    public void Validate_ShouldReturnFailure_WhenNameIsEmpty()
    {
        var command = new UpdateProfileCommand("");

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldHaveSingleItem();
        validation.Errors[0].Field.ShouldBe("Name");
        validation.Errors[0].Message.ShouldBe("Nome é obrigatório");
    }

    [Fact]
    public void Validate_ShouldReturnFailure_WhenNameIsTooLong()
    {
        var command = new UpdateProfileCommand(new string('a', 201));

        var validation = command.Validate();

        validation.IsFailure.ShouldBeTrue();
        validation.Errors.ShouldHaveSingleItem();
        validation.Errors[0].Field.ShouldBe("Name");
        validation.Errors[0].Message.ShouldBe("O nome pode ter no máximo 255 caracteres");
    }

    [Fact]
    public void Validate_ShouldReturnSuccess_WhenNameIsValid()
    {
        var command = new UpdateProfileCommand("Novo Nome");

        var validation = command.Validate();

        validation.IsFailure.ShouldBeFalse();
        validation.Errors.ShouldBeEmpty();
    }
}