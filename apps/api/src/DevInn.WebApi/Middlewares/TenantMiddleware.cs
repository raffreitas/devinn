using System.Diagnostics;

using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Infrastructure.Common.Constants;
using DevInn.WebApi.Common;

using Microsoft.AspNetCore.Mvc;

namespace DevInn.WebApi.Middlewares;

public sealed class TenantMiddleware(ITenantContext tenantContext, ILogger<TenantMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        string[] publicPaths =
        [
            "/health",
            "/scalar",
            "/openapi",
            "/api/v1/auth/login"
        ];
        if (publicPaths.Any(path => context.Request.Path.StartsWithSegments(path, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }

        // if (context.User.Identity is { IsAuthenticated: false })
        // {
        //     logger.LogWarning("Requisição não autenticada para {Path}", context.Request.Path);
        //     context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        //     await context.Response.WriteAsJsonAsync(new ApiProblemDetails
        //     {
        //         Title = "Não autorizado",
        //         Status = StatusCodes.Status401Unauthorized,
        //         Detail = "A requisição não foi autenticada."
        //     });
        //     return;
        // }

        var tenantId = ExtractTenantId(context);

        if (tenantId == Guid.Empty && !context.User.IsInRole(nameof(UserRole.SuperAdmin)))
        {
            logger.LogWarning("Nenhum tenant identificado na requisição para {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
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
            Activity.Current?.SetTag("tenant.id", tenantId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao definir tenant para a requisição");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Erro interno do servidor", Status = StatusCodes.Status500InternalServerError,
            });
            return;
        }

        await next(context);
    }

    private static Guid ExtractTenantId(HttpContext context)
    {
        // 1. Verificar header customizado
        if (context.Request.Headers.TryGetValue(TenantKeys.InnHeader, out var tenantHeader) &&
            Guid.TryParse(tenantHeader.ToString(), out var tenantFromHeader))
        {
            return tenantFromHeader;
        }

        // 2. Verificar claim do JWT
        var tenantClaim = context.User.FindFirst(TenantKeys.InnClaim)?.Value;

        if (tenantClaim != null && Guid.TryParse(tenantClaim, out var tenantFromClaim))
        {
            return tenantFromClaim;
        }

        return Guid.Empty;
    }
}