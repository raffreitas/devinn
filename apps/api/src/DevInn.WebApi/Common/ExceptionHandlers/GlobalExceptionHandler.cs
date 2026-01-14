using DevInn.Domain.SeedWork;

using Microsoft.AspNetCore.Diagnostics;

namespace DevInn.WebApi.Common.ExceptionHandlers;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception occurred");

        if (exception is DomainException domainException)
        {
            await httpContext.Response.WriteAsJsonAsync(
                new ApiProblemDetails
                {
                    Title = "Requisição inválida",
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Detail = domainException.Message
                }, cancellationToken: cancellationToken);
            return true;
        }

        await httpContext.Response.WriteAsJsonAsync(
            new ApiProblemDetails
            {
                Title = "Erro Interno do Servidor",
                Status = StatusCodes.Status500InternalServerError,
                Detail = "Houve um erro inesperado ao processar a requisição."
            }, cancellationToken);

        return true;
    }
}