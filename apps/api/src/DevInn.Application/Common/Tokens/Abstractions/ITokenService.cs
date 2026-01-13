namespace DevInn.Application.Common.Tokens.Abstractions;

public interface ITokenService
{
    Task<TokenResponse> GenerateTokenAsync(TokenRequest request, CancellationToken cancellationToken = default);
}