using DevInn.Backup.Postgres;
using Shouldly;

namespace DevInn.Backup.Tests.Postgres;

public sealed class PostgresConnectionSettingsTests
{
    [Fact]
    public void Parse_PostgresUrl_MapsToPgEnvironmentWithoutConnectionStringArgument()
    {
        var settings = PostgresConnectionSettings.Parse(
            "postgresql://backup-user:p%40ss@postgres.railway.internal:5432/devinn?sslmode=require");

        var environment = settings.ToPgEnvironment();

        environment["PGHOST"].ShouldBe("postgres.railway.internal");
        environment["PGDATABASE"].ShouldBe("devinn");
        environment["PGUSER"].ShouldBe("backup-user");
        environment["PGPASSWORD"].ShouldBe("p@ss");
        environment["PGPORT"].ShouldBe("5432");
        environment["PGSSLMODE"].ShouldBe("require");
    }

    [Fact]
    public void Parse_KeywordConnectionString_MapsToPgEnvironment()
    {
        var settings = PostgresConnectionSettings.Parse(
            "Host=localhost;Port=5433;Database=devinn;Username=postgres;Password=postgres;SSL Mode=Disable");

        var environment = settings.ToPgEnvironment();

        environment["PGHOST"].ShouldBe("localhost");
        environment["PGDATABASE"].ShouldBe("devinn");
        environment["PGUSER"].ShouldBe("postgres");
        environment["PGPASSWORD"].ShouldBe("postgres");
        environment["PGPORT"].ShouldBe("5433");
        environment["PGSSLMODE"].ShouldBe("disable");
    }
}
