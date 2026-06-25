using System.Data.Common;
using System.Net;

namespace DevInn.Backup.Postgres;

internal sealed record PostgresConnectionSettings(
    string Host,
    string Database,
    string Username,
    string Password,
    int? Port,
    string? SslMode)
{
    public static PostgresConnectionSettings Parse(string connectionString)
    {
        if (Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) &&
            (uri.Scheme.Equals("postgres", StringComparison.OrdinalIgnoreCase) ||
             uri.Scheme.Equals("postgresql", StringComparison.OrdinalIgnoreCase)))
        {
            return ParseUri(uri);
        }

        return ParseKeywordConnectionString(connectionString);
    }

    public IReadOnlyDictionary<string, string> ToPgEnvironment()
    {
        var environment = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["PGHOST"] = Host,
            ["PGDATABASE"] = Database,
            ["PGUSER"] = Username,
            ["PGPASSWORD"] = Password
        };

        if (Port is not null)
            environment["PGPORT"] = Port.Value.ToString();

        if (!string.IsNullOrWhiteSpace(SslMode))
            environment["PGSSLMODE"] = NormalizeSslMode(SslMode);

        return environment;
    }

    private static PostgresConnectionSettings ParseUri(Uri uri)
    {
        var userInfo = uri.UserInfo.Split(':', 2);
        if (userInfo.Length != 2)
            throw new InvalidOperationException("BACKUP_DATABASE_URL must include username and password.");

        var query = ParseQuery(uri.Query);

        return new PostgresConnectionSettings(
            uri.Host,
            Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Uri.UnescapeDataString(userInfo[0]),
            Uri.UnescapeDataString(userInfo[1]),
            uri.IsDefaultPort ? null : uri.Port,
            query.GetValueOrDefault("sslmode"));
    }

    private static PostgresConnectionSettings ParseKeywordConnectionString(string connectionString)
    {
        var values = new DbConnectionStringBuilder
        {
            ConnectionString = connectionString
        };

        var host = Get(values, "Host");
        var database = Get(values, "Database");
        var username = GetOptional(values, "Username") ??
                       GetOptional(values, "User Id") ??
                       GetOptional(values, "UserID") ??
                       throw new InvalidOperationException("BACKUP_DATABASE_URL must include Username.");
        var password = Get(values, "Password");
        var sslMode = GetOptional(values, "SSL Mode") ?? GetOptional(values, "SslMode");

        int? port = null;
        if (GetOptional(values, "Port") is { } portText && int.TryParse(portText, out var parsedPort))
            port = parsedPort;

        return new PostgresConnectionSettings(host, database, username, password, port, sslMode);
    }

    private static Dictionary<string, string> ParseQuery(string query)
    {
        return query.TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(part => part.Split('=', 2))
            .Where(pair => pair.Length == 2)
            .ToDictionary(
                pair => WebUtility.UrlDecode(pair[0]),
                pair => WebUtility.UrlDecode(pair[1]),
                StringComparer.OrdinalIgnoreCase);
    }

    private static string Get(DbConnectionStringBuilder values, string key)
        => GetOptional(values, key) is { } value
            ? value
            : throw new InvalidOperationException($"BACKUP_DATABASE_URL must include {key}.");

    private static string? GetOptional(DbConnectionStringBuilder values, string key)
        => values.TryGetValue(key, out var value) &&
           value?.ToString() is { } text &&
           !string.IsNullOrWhiteSpace(text)
            ? text
            : null;

    private static string NormalizeSslMode(string sslMode)
        => sslMode.ToLowerInvariant() switch
        {
            "disable" => "disable",
            "allow" => "allow",
            "prefer" => "prefer",
            "require" => "require",
            "verify-ca" => "verify-ca",
            "verify-full" => "verify-full",
            _ => sslMode
        };
}
