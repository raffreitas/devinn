using FluentValidation;

namespace DevInn.Application.Common.Validation;

public static class PasswordValidationExtensions
{
    public static IRuleBuilderOptions<T, string> MustMatchPasswordPolicy<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        string passwordLabel = "A senha")
    {
        return ruleBuilder
            .MinimumLength(8).WithMessage($"{passwordLabel} deve ter no mínimo 8 caracteres.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage(
                $"{passwordLabel} deve conter pelo menos um caractere não alfanumérico.")
            .Matches(@"\d").WithMessage($"{passwordLabel} deve conter pelo menos um número.")
            .Matches(@"[A-Z]").WithMessage($"{passwordLabel} deve conter pelo menos uma letra maiúscula.");
    }
}