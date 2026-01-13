using DevInn.Features.Users.Domain;

namespace DevInn.Shared.Identity.Constants;

public static class Roles
{
    public const string SuperAdmin = nameof(UserRole.SuperAdmin);
    public const string InnAdmin = nameof(UserRole.Admin);
}