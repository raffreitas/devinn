using DevInn.Shared.Messaging.Errors;

using FluentValidation.Results;

using ValidationFailure = DevInn.Shared.Messaging.ValidationFailure;

namespace DevInn.Shared.Extensions;

public static class ValidationExtensions
{
    public static (bool, ValidationFailure[]) ToValidationErrors(this ValidationResult validationResult)
    {
        if (validationResult.IsValid)
            return (false, []);


        var errors = validationResult.Errors
            .Select(e => new ValidationFailure(e.PropertyName, e.ErrorMessage))
            .ToArray();

        return (true, errors);
    }

    public static ValidationError ToError(this ValidationFailure[] failures) => new(failures);
}