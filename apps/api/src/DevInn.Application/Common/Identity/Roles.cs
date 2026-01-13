namespace DevInn.Application.Common.Identity;

public static class Roles
{
    public const string SuperAdmin = nameof(UserRole.SuperAdmin);
    public const string InnAdmin = nameof(UserRole.InnAdmin);
}

public enum UserRole
{
    SuperAdmin = 1,
    InnAdmin
}