namespace DevInn.Application.Common.Identity;

public sealed record User(
    Guid Id,
    Guid? TenantId,
    string Name,
    string Email,
    UserRole[] Roles);