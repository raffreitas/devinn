namespace DevInn.Application.Common.Identity;

public sealed record User(
    Guid Id,
    Guid? TenantId,
    string Name,
    string Email,
    UserRole[] Roles);

public enum UserRole
{
    SuperAdmin = 1,
    InnAdmin
}