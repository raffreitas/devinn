using DevInn.Backup.Configuration;
using DevInn.Backup.System;

namespace DevInn.Backup.Postgres;

internal interface IDumpService
{
    Task CreateDumpAsync(PostgresConnectionSettings connection, string outputPath, CancellationToken cancellationToken);
    Task ValidateDumpAsync(string dumpPath, CancellationToken cancellationToken);
}

internal sealed class PostgresDumpService(BackupOptions options, ProcessRunner processRunner) : IDumpService
{
    public Task CreateDumpAsync(
        PostgresConnectionSettings connection,
        string outputPath,
        CancellationToken cancellationToken)
    {
        var args = $"--format=custom --compress={options.DumpCompressionLevel} --no-owner --no-acl --file \"{outputPath}\"";
        return processRunner.RunAsync(
            options.PgDumpPath,
            args,
            connection.ToPgEnvironment(),
            TimeSpan.FromMinutes(options.DumpTimeoutMinutes),
            cancellationToken);
    }

    public Task ValidateDumpAsync(string dumpPath, CancellationToken cancellationToken)
    {
        var args = $"--list \"{dumpPath}\"";
        return processRunner.RunAsync(
            options.PgRestorePath,
            args,
            environment: null,
            TimeSpan.FromMinutes(options.DumpTimeoutMinutes),
            cancellationToken);
    }
}
