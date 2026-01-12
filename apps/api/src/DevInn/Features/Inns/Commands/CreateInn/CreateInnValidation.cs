using FluentValidation;

namespace DevInn.Features.Inns.Commands.CreateInn;

public class CreateInnValidation : AbstractValidator<CreateInnCommand>
{
    public CreateInnValidation()
    {
    }
}