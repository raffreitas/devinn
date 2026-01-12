using DevInn.Shared.Extensions;
using DevInn.Shared.Messaging;

using FluentResults;

using Mediator;

namespace DevInn.Features.Inns.Commands.CreateInn;

public sealed record CreateInnCommand(
    string Name,
    string Address,
    string City,
    string Country,
    string State,
    string Phone,
    string Email) : ICommand<Result<Guid>>
{
    public (bool HasError, ValidationFailure[] Errors) Validate() =>
        new CreateInnValidation().Validate(this).ToValidationErrors();
}