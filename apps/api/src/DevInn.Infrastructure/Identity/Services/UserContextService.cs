using System.Security.Claims;

using DevInn.Application.Common.Identity.Abstractions;
using DevInn.Infrastructure.Common.Exceptions;

using Microsoft.AspNetCore.Http;

namespace DevInn.Infrastructure.Identity.Services;

internal sealed class UserContextService(IHttpContextAccessor httpContextAccessor) : IUserContext
{
    public Guid UserId => GetUserId();

    private Guid GetUserId()
    {
        var httpContext = httpContextAccessor.HttpContext
                          ?? throw new InvalidOperationException("HTTP context is not available.");

        var userClaims = httpContext.User;

        if (userClaims.Identity is null || !userClaims.Identity.IsAuthenticated)
            throw new UnauthorizedException("Usuário não autorizado.");

        var userIdClaim = userClaims.FindFirst(ClaimTypes.NameIdentifier)
                          ?? throw new UnauthorizedException("Usuário não autorizado.");

        var userId = Guid.Parse(userIdClaim.Value);

        return userId;
    }
}