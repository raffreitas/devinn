using DevInn.Shared.Extensions;
using DevInn.Shared.Messaging;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Features.Authentication.Commands.LoginUser;

public sealed record LoginCommand(string Email, string Password) : ICommand<Result<LoginResult>>
{
    public (bool HasError, ValidationFailure[] Errors) Validate() =>
        new LoginValidator().Validate(this).ToValidationErrors();
}

public sealed class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email obrigatório.")
            .EmailAddress().WithMessage("Email inválido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Senha obrigatória.");
    }
}