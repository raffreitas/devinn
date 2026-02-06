using DevInn.Domain.SeedWork;
using DevInn.Infrastructure.Common.Exceptions;

using Microsoft.AspNetCore.Diagnostics;

namespace DevInn.WebApi.Common.ExceptionHandlers;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "An unhandled exception occurred {Message}", exception.Message);

        switch (exception)
        {
            case DomainException domainException:
                httpContext.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
                await httpContext.Response.WriteAsJsonAsync(
                    new ApiProblemDetails
                    {
                        Title = "Requisição inválida",
                        Status = StatusCodes.Status422UnprocessableEntity,
                        Detail = domainException.Message
                    }, cancellationToken: cancellationToken);
                return true;
            case UnauthorizedException:
                httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await httpContext.Response.WriteAsJsonAsync(
                    new ApiProblemDetails
                    {
                        Title = "Acesso não autorizado",
                        Status = StatusCodes.Status401Unauthorized,
                        Detail = exception.Message
                    }, cancellationToken: cancellationToken);
                return true;
            case BadHttpRequestException:
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await httpContext.Response.WriteAsJsonAsync(
                    new ApiProblemDetails
                    {
                        Title = "Requisição inválida",
                        Status = StatusCodes.Status400BadRequest,
                        Detail = "Houve um erro na formatação da requisição. Verifique os dados enviados e tente novamente."
                    }, cancellationToken: cancellationToken);
                return true;
            default:
                httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
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
}