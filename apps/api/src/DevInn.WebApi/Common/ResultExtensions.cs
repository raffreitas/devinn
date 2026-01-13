using System.Net;

using DevInn.Application.Common.Errors;

using FluentResults;

using Microsoft.AspNetCore.Http.HttpResults;

namespace DevInn.WebApi.Common;

public static class ResultExtensions
{
    public static IResult ToOk<T>(this Result<T> result) where T : notnull
    {
        return result.IsFailed
            ? result.ToError()
            : TypedResults.Ok(new ApiResource<T>(result.Value));
    }

    public static IResult ToCreated<T>(this Result<T> result, string? location = null) where T : notnull
    {
        return result.IsFailed
            ? result.ToError()
            : TypedResults.Created(location, new ApiResource<T>(result.Value));
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
            _ => (HttpStatusCode.InternalServerError, "Erro interno do servidor")
        };

        var problemDetails = new ApiProblemDetails
        {
            Title = title,
            Detail = error.Message,
            Status = (int)statusCode,
            Errors = error is ValidationError err && err.Errors.Length != 0
                ? err.Errors.ToDictionary(e => e.Field, e => e.Message)
                : null
        };
        return TypedResults.Problem(problemDetails);
    }
}