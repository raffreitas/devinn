using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Application.Common.Validation;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Commands.Register;

internal sealed class RegisterCommandHandler(IIdentityService identityService, IInnRepository innRepository)
    : ICommandHandler<RegisterCommand, Result>
{
    public async ValueTask<Result> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var validation = command.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        var existsInn = command.InnId is null
                        || await innRepository.ExistsAsync(command.InnId.Value, cancellationToken);

        if (!existsInn)
            return Result.Fail(new NotFoundError("A pousada especificada não existe"));

        var request = new RegisterUserRequest(
            command.Name,
            command.Email,
            command.Password,
            command.InnId,
            command.Role
        );
        var registerResult = await identityService.RegisterAsync(request, cancellationToken);
        return registerResult.IsFailed ? Result.Fail(registerResult.Errors) : Result.Ok();
    }
}