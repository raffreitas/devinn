using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.ChangePassword;

public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword) : ICommand<Result>
{
    public Validation Validate() => new ChangePasswordCommandValidator().Validate(this).ToFailure();
};

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Senha atual deve ser informada");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Nova senha deve ser informada")
            .MinimumLength(6).WithMessage("A nova senha deve conter no mínimo 6 caracteres");

        RuleFor(x => x.NewPassword)
            .Must((x, newPassword) => x.CurrentPassword != newPassword)
            .WithMessage("A nova senha deve ser diferente da senha atual");
    }
}