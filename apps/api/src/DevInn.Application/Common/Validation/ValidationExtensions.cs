using DevInn.Application.Common.Errors;

using FluentValidation.Results;

namespace DevInn.Application.Common.Validation;

public static class ValidationFailureExtensions
{
    public static ValidationError ToError(this Validation validation) => validation.IsFailure
        ? new ValidationError(validation.Errors)
        : throw new InvalidOperationException("Cannot create ValidationError from a successful Validation.");

    public static Validation ToFailure(this ValidationResult validationResult)
    {
        if (validationResult.IsValid)
            return new Validation(false, []);

        var errors = validationResult.Errors
            .Select(e => new ValidationFailure(e.PropertyName, e.ErrorMessage))
            .ToArray();

        return new Validation(true, errors);
    }
}