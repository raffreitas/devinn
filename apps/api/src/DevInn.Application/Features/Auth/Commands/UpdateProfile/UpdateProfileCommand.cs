using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(string Name) : ICommand<Result>
{
    public Validation Validate() => new UpdateProfileCommandValidator().Validate(this).ToFailure();
};

internal sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório");

        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("O nome pode ter no máximo 255 caracteres");
    }
}