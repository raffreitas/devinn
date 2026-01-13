using DevInn.Application.Common.Validation;

using FluentResults;

namespace DevInn.Application.Common.Errors;

public sealed class NotFoundError(string message) : Error(message)
{
    public const string Name = nameof(NotFoundError);
};

public sealed class ValidationError : Error
{
    private const string DefaultMessage = "Um ou mais erros de validação ocorreram.";
    public const string Name = nameof(ValidationError);
    public ValidationFailure[] Errors { get; } = [];

    public ValidationError(string? message = null) : base(message ?? DefaultMessage)
    {
    }

    public ValidationError(ValidationFailure[] error) : base(DefaultMessage)
    {
        Errors = error;
    }
}

public sealed class ConflictError(string message) : Error(message)
{
    public const string Name = nameof(ConflictError);
};

public sealed class UnauthorizedError(string message) : Error(message)
{
    public const string Name = nameof(UnauthorizedError);
};

public sealed class ForbiddenError(string message) : Error(message)
{
    public const string Name = nameof(ForbiddenError);
};