namespace DevInn.Application.Common.Identity;

public static class Policies
{
    public const string SuperAdminOnly = nameof(SuperAdminOnly);
    public const string InnAdminOnly = nameof(InnAdminOnly);
}

public enum UserRole
{
    SuperAdmin = 1,
    InnAdmin
}