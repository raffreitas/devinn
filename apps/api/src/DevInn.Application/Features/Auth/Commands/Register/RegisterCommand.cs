using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.Register;

public sealed record RegisterCommand(
    string Name,
    string Email,
    string Password,
    Guid? InnId,
    UserRole Role = UserRole.InnAdmin) : ICommand<Result>
{
    public Validation Validate() => new RegisterCommandValidator().Validate(this).ToFailure();
}

internal sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(200).WithMessage("O nome pode ter no máximo 200 caracteres.");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("O papel do usuário é inválido.");

        When(x => x.Role != UserRole.SuperAdmin, () =>
        {
            RuleFor(x => x.InnId)
                .NotEmpty().WithMessage(
                    "O Id da pousada é obrigatório para usuários que não são super administradores.");
        });

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O email é obrigatório.")
            .EmailAddress().WithMessage("O email fornecido não é válido.")
            .MaximumLength(200).WithMessage("O email pode ter no máximo 200 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("A senha é obrigatória.")
            .MustMatchPasswordPolicy("A nova senha")
            .MaximumLength(100).WithMessage("A senha pode ter no máximo 100 caracteres.");
    }
}
