using System.Net;

using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Pagination;

using FluentResults;

using Microsoft.AspNetCore.Http.HttpResults;

namespace DevInn.WebApi.Common;

public static class ResultExtensions
{
    public static IResult ToOk<T>(this Result<PaginatedResult<T>> result)
    {
        if (result.IsFailed) return result.ToError();

        var paged = result.Value;
        var resource = new ApiResource<T[]>(paged.Items, Metadata.FromPaginationResult(paged));

        return TypedResults.Ok(resource);
    }

    public static IResult ToOk<T>(this Result<T> result) where T : notnull
    {
        return result.IsFailed
            ? result.ToError()
            : TypedResults.Ok(new ApiResource<T>(result.Value));
    }

    public static IResult ToCreated(this Result result)
    {
        return result.IsFailed
            ? result.ToError()
            : TypedResults.Created();
    }

    public static IResult ToCreated<T>(this Result<T> result, Func<T, string>? locationFactory = null)
        where T : notnull
    {
        if (result.IsFailed)
            return result.ToError();

        string resourceUri = locationFactory is not null
            ? locationFactory.Invoke(result.Value)
            : string.Empty;

        return TypedResults.Created(resourceUri, new ApiResource<T>(result.Value));
    }

    public static IResult ToNoContent(this Result result)
    {
        return result.IsFailed ? result.ToError() : TypedResults.NoContent();
    }

    private static ProblemHttpResult ToError(this IResultBase result)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException("Não é possível converter um resultado bem-sucedido em um erro.");

        var error = result.Errors[0];

        (HttpStatusCode statusCode, string title) = error switch
        {
            NotFoundError => (HttpStatusCode.NotFound, "Recurso não encontrado"),
            ValidationError => (HttpStatusCode.UnprocessableEntity, "Requisição inválida"),
            UnauthorizedError => (HttpStatusCode.Unauthorized, "Acesso não autorizado"),
            ForbiddenError => (HttpStatusCode.Forbidden, "Acesso proibido"),
            ConflictError => (HttpStatusCode.Conflict, "Conflito de recurso"),
            _ => (HttpStatusCode.BadRequest, "Requisição inválida")
        };

        var problemDetails = new ApiProblemDetails
        {
            Title = title,
            Detail = error.Message,
            Status = (int)statusCode,
            Errors = ToProblemErrors(error)
        };
        return TypedResults.Problem(problemDetails);
    }

    private static Dictionary<string, string>? ToProblemErrors(IError error)
    {
        if (error is not ValidationError validationError || validationError.Errors.Length == 0)
            return null;

        return validationError.Errors
            .Select(e => (Field: NormalizeValidationFieldPath(e.Field), e.Message))
            .DistinctBy(e => e.Field, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(e => e.Field, e => e.Message, StringComparer.OrdinalIgnoreCase);
    }

    private static string NormalizeValidationFieldPath(string field)
    {
        if (string.IsNullOrWhiteSpace(field))
            return field;

        var segments = field.Split('.', StringSplitOptions.RemoveEmptyEntries);

        return string.Join('.', segments.Select(NormalizeSegment));
    }

    private static string NormalizeSegment(string segment)
    {
        var bracketIndex = segment.IndexOf('[');

        if (bracketIndex < 0)
            return ToCamelCase(segment);

        var property = segment[..bracketIndex];
        var suffix = segment[bracketIndex..];

        return $"{ToCamelCase(property)}{suffix}";
    }

    private static string ToCamelCase(string value)
    {
        if (string.IsNullOrEmpty(value) || !char.IsUpper(value[0]))
            return value;

        if (value.Length == 1)
            return value.ToLowerInvariant();

        return char.ToLowerInvariant(value[0]) + value[1..];
    }
}