using DevInn.Application.Common.Validation;

using FluentValidation;

namespace DevInn.Application.Features.Auth.Login;

public record LoginInput(string Email, string Password)
{
    public Validation Validate() => new LoginInputValidator().Validate(this).ToFailure();
};

public sealed class LoginInputValidator : AbstractValidator<LoginInput>
{
    public LoginInputValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email é obrigatório.");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email inválido.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Senha é obrigatória.");
    }
}