using System.Diagnostics;

using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Infrastructure.Common.Constants;
using DevInn.WebApi.Common;

namespace DevInn.WebApi.Middlewares;

public sealed class TenantMiddleware(ITenantContext tenantContext, ILogger<TenantMiddleware> logger) : IMiddleware
{
    private static readonly string[] PublicPaths =
    [
        "/health",
        "/scalar", "/openapi",

        "/api/v1/auth/login",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/ical"
    ];

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (PublicPaths.Any(path => context.Request.Path.StartsWithSegments(path, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }

        if (context.User.Identity is { IsAuthenticated: false })
        {
            logger.LogWarning("Requisição não autenticada para {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new ApiProblemDetails
            {
                Title = "Não autorizado",
                Status = StatusCodes.Status401Unauthorized,
                Detail = "A requisição não foi autenticada."
            });
            return;
        }

        var tenantResolution = ResolveTenantId(context);
        if (tenantResolution.IsFailure)
        {
            logger.LogWarning("Tenant inválido na requisição para {Path}: {Reason}",
                context.Request.Path,
                tenantResolution.Detail);
            context.Response.StatusCode = tenantResolution.StatusCode;
            await context.Response.WriteAsJsonAsync(new ApiProblemDetails
            {
                Title = tenantResolution.Title,
                Status = tenantResolution.StatusCode,
                Detail = tenantResolution.Detail
            });
            return;
        }

        var tenantId = tenantResolution.TenantId;

        if (tenantId == Guid.Empty && !context.User.IsInRole(nameof(UserRole.SuperAdmin)))
        {
            logger.LogWarning("Nenhum tenant identificado na requisição para {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ApiProblemDetails
            {
                Title = "Requisição inválida",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Nenhum tenant válido foi encontrado na requisição."
            });
            return;
        }

        try
        {
            tenantContext.SetTenant(new Tenant(tenantId));
            Activity.Current?.SetTag("tenant.id", tenantId.ToString());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao definir tenant para a requisição");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new ApiProblemDetails
            {
                Title = "Erro interno do servidor",
                Status = StatusCodes.Status500InternalServerError,
                Detail = "Houve um erro inesperado ao processar a requisição."
            });
            return;
        }

        await next(context);
    }

    private static TenantResolution ResolveTenantId(HttpContext context)
    {
        var headerResult = GetTenantFromHeader(context);
        if (headerResult.IsMalformed)
        {
            return TenantResolution.Failure(
                StatusCodes.Status400BadRequest,
                "Requisição inválida",
                "O tenant informado no cabeçalho é inválido.");
        }

        var isSuperAdmin = context.User.IsInRole(nameof(UserRole.SuperAdmin));
        if (isSuperAdmin)
        {
            return TenantResolution.Success(headerResult.TenantId ?? Guid.Empty);
        }

        var tenantFromClaim = GetTenantFromClaim(context);
        if (tenantFromClaim is null)
        {
            return TenantResolution.Success(Guid.Empty);
        }

        if (headerResult.TenantId is not null && headerResult.TenantId != tenantFromClaim)
        {
            return TenantResolution.Failure(
                StatusCodes.Status403Forbidden,
                "Acesso negado",
                "O tenant informado não corresponde ao tenant do usuário autenticado.");
        }

        return TenantResolution.Success(tenantFromClaim.Value);
    }

    private static HeaderTenantResult GetTenantFromHeader(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(TenantKeys.InnHeader, out var tenantHeader))
            return HeaderTenantResult.Empty;

        return Guid.TryParse(tenantHeader.ToString(), out var tenantFromHeader)
            ? HeaderTenantResult.Valid(tenantFromHeader)
            : HeaderTenantResult.Malformed;
    }

    private static Guid? GetTenantFromClaim(HttpContext context)
    {
        var tenantClaim = context.User.FindFirst(TenantKeys.InnClaim)?.Value;
        return Guid.TryParse(tenantClaim, out var tenantFromClaim)
            ? tenantFromClaim
            : null;
    }

    private readonly record struct HeaderTenantResult(Guid? TenantId, bool IsMalformed)
    {
        public static HeaderTenantResult Empty => new(null, false);
        public static HeaderTenantResult Malformed => new(null, true);
        public static HeaderTenantResult Valid(Guid tenantId) => new(tenantId, false);
    }

    private readonly record struct TenantResolution(
        bool IsFailure,
        Guid TenantId,
        int StatusCode,
        string Title,
        string Detail)
    {
        public static TenantResolution Success(Guid tenantId) =>
            new(false, tenantId, StatusCodes.Status200OK, string.Empty, string.Empty);

        public static TenantResolution Failure(int statusCode, string title, string detail) =>
            new(true, Guid.Empty, statusCode, title, detail);
    }
}
