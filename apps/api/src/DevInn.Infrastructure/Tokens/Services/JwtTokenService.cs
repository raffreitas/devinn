using System.Security.Claims;
using System.Text;

using DevInn.Application.Common.Tokens;
using DevInn.Application.Common.Tokens.Abstractions;
using DevInn.Infrastructure.Common.Constants;
using DevInn.Infrastructure.Tokens.Options;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DevInn.Infrastructure.Tokens.Services;

internal sealed class JwtTokenService(IOptions<JwtTokenOptions> options) : ITokenService
{
    private readonly JwtTokenOptions _options = options.Value;

    public Task<TokenResponse> GenerateTokenAsync(TokenRequest request, CancellationToken cancellationToken = default)
    {
        var signinKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_options.SecretKey));
        var credentials = new SigningCredentials(signinKey, SecurityAlgorithms.HmacSha256);

        var roleClaims = request.Roles
            .SelectMany(role => new List<Claim> { new(ClaimTypes.Role, role), new("role", role) });

        List<Claim> claims =
        [
            new(JwtRegisteredClaimNames.Sub, request.UserId.ToString()),
            ..roleClaims
        ];

        if (request.TenantId is not null)
            claims.Add(new Claim(TenantKeys.InnClaim, request.TenantId.Value.ToString()));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_options.ExpirationInMinutes),
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JsonWebTokenHandler();

        var accessToken = tokenHandler.CreateToken(tokenDescriptor);
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpirationInMinutes);
        return Task.FromResult(new TokenResponse(accessToken, expiresAt));
    }
}