using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : ICommand<Result<LoginResult>>
{
    public Validation Validate() => new LoginInputValidator().Validate(this).ToFailure();
};

public sealed class LoginInputValidator : AbstractValidator<LoginCommand>
{
    public LoginInputValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email é obrigatório.");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email inválido.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Senha é obrigatória.");
    }
}