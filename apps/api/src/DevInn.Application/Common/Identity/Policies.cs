namespace DevInn.Application.Common.Identity;

public static class Policies
{
    public const string SuperAdminOnly = nameof(SuperAdminOnly);
    public const string InnAdminOnly = nameof(InnAdminOnly);

    public static string[] GetRolesForPolicy(string policyName) => policyName switch
    {
        SuperAdminOnly => [nameof(UserRole.SuperAdmin)],
        InnAdminOnly => [nameof(UserRole.InnAdmin), nameof(UserRole.SuperAdmin)],
        _ => throw new ArgumentOutOfRangeException(nameof(policyName), policyName, null)
    };
}