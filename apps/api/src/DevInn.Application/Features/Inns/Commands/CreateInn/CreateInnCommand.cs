using DevInn.Application.Common.Validation;

using FluentResults;

using FluentValidation;

using Mediator;

namespace DevInn.Application.Features.Inns.Commands.CreateInn;

public sealed record CreateInnCommand(
    string Name,
    string Address,
    string City,
    string Country,
    string State,
    string Phone,
    string Email) : ICommand<Result<Guid>>
{
    public Validation Validate() => new CreateInnInputValidation().Validate(this).ToFailure();
}

public class CreateInnInputValidation : AbstractValidator<CreateInnCommand>
{
    public CreateInnInputValidation()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nome é obrigatório.");
        RuleFor(x => x.Name).MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Address).NotEmpty().WithMessage("Endereço é obrigatório.");
        RuleFor(x => x.Address).MaximumLength(200).WithMessage("Endereço deve ter no máximo 200 caracteres");

        RuleFor(x => x.City).NotEmpty().WithMessage("Cidade é obrigatória.");
        RuleFor(x => x.City).MaximumLength(100).WithMessage("Cidade deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Country).NotEmpty().WithMessage("País é obrigatório.");
        RuleFor(x => x.Country).MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");

        RuleFor(x => x.State).NotEmpty().WithMessage("Estado é obrigatório.");
        RuleFor(x => x.State).MaximumLength(100).WithMessage("Estado deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Phone).NotEmpty().WithMessage("Telefone é obrigatório.");
        RuleFor(x => x.Phone).MaximumLength(15).WithMessage("Telefone deve ter no máximo 15 caracteres.");

        RuleFor(x => x.Email).NotEmpty().WithMessage("Email é obrigatório.");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email inválido.");
        RuleFor(x => x.Email).MaximumLength(100).WithMessage("Email deve ter no máximo 100 caracteres.");
    }
}