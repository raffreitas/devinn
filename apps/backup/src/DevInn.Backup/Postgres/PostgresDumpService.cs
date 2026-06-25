using DevInn.Backup.Configuration;
using DevInn.Backup.System;
using Microsoft.Extensions.Options;

namespace DevInn.Backup.Postgres;

internal interface IDumpService
{
    Task CreateDumpAsync(PostgresConnectionSettings connection, string outputPath, CancellationToken cancellationToken);
    Task ValidateDumpAsync(string dumpPath, CancellationToken cancellationToken);
}

internal sealed class PostgresDumpService(IOptions<BackupOptions> options, ProcessRunner processRunner) : IDumpService
{
    private readonly BackupOptions _options = options.Value;

    public Task CreateDumpAsync(
        PostgresConnectionSettings connection,
        string outputPath,
        CancellationToken cancellationToken)
    {
        var args = $"--format=custom --compress={_options.DumpCompressionLevel} --no-owner --no-acl --file \"{outputPath}\"";
        return processRunner.RunAsync(
            _options.PgDumpPath,
            args,
            connection.ToPgEnvironment(),
            TimeSpan.FromMinutes(_options.DumpTimeoutMinutes),
            cancellationToken);
    }

    public Task ValidateDumpAsync(string dumpPath, CancellationToken cancellationToken)
    {
        var args = $"--list \"{dumpPath}\"";
        return processRunner.RunAsync(
            _options.PgRestorePath,
            args,
            environment: null,
            TimeSpan.FromMinutes(_options.DumpTimeoutMinutes),
            cancellationToken);
    }
}
