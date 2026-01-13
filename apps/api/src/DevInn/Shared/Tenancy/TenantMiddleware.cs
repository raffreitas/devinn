using System.Diagnostics;

namespace DevInn.Shared.Tenancy;

public sealed class TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        var tenantId = ExtractTenantId(context);

        if (tenantId == Guid.Empty)
        {
            logger.LogWarning("Nenhum tenant identificado na requisição para {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant inválido ou não especificado" });
            return;
        }

        try
        {
            tenantContext.SetTenant(tenantId);
            Activity.Current?.SetTag("tenant.id", tenantId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao definir tenant para a requisição");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "Erro ao processar tenant" });
            return;
        }

        await next(context);
    }

    private static Guid ExtractTenantId(HttpContext context)
    {
        // 1. Verificar header customizado
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) &&
            Guid.TryParse(tenantHeader.ToString(), out var tenantFromHeader))
        {
            return tenantFromHeader;
        }

        // 2. Verificar claim do JWT
        var tenantClaim = context.User.FindFirst("tenant_id")?.Value ?? context.User.FindFirst("inn_id")?.Value;

        if (tenantClaim != null && Guid.TryParse(tenantClaim, out var tenantFromClaim))
        {
            return tenantFromClaim;
        }

        return Guid.Empty;
    }
}