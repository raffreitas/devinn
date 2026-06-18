namespace DevInn.Application.Common.Tokens.Abstractions;

public interface IAccessTokenProvider
{
    Task<TokenResponse> GenerateTokenAsync(TokenRequest request, CancellationToken cancellationToken = default);
}
