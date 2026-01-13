namespace DevInn.Application.Common.Tokens;

public sealed record TokenRequest(Guid UserId, Guid? TenantId, IEnumerable<string> Roles);