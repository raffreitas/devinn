using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.ResetPassword;

public sealed record ResetPasswordCommand(Guid UserId, string Token, string NewPassword) : ICommand<Result>
{
    public Validation Validate() => new ResetPasswordCommandValidator().Validate(this).ToFailure();
}

public sealed class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Usuário é obrigatório.");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token é obrigatório.")
            .MaximumLength(4096).WithMessage("Token inválido.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("A nova senha é obrigatória.")
            .MustMatchPasswordPolicy("A nova senha")
            .MaximumLength(100).WithMessage("A nova senha pode ter no máximo 100 caracteres.");
    }
}