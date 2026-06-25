using DevInn.Backup.Configuration;
using DevInn.Backup.Jobs;
using DevInn.Backup.Observability;
using DevInn.Backup.Postgres;
using DevInn.Backup.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Shouldly;

namespace DevInn.Backup.Tests.Jobs;

public sealed class BackupJobTests
{
    [Fact]
    public async Task RunAsync_WhenValidationFails_DoesNotUploadBackup()
    {
        using var workingDirectory = new TemporaryDirectory();
        using var metrics = new BackupMetrics();
        var storage = new FakeStorage();
        var dump = new FakeDumpService { FailValidation = true };
        var job = new BackupJob(CreateOptions(workingDirectory.Path), dump, storage, NullLogger<BackupJob>.Instance, metrics);

        await Should.ThrowAsync<InvalidOperationException>(() => job.RunAsync(CancellationToken.None));

        storage.UploadedKeys.ShouldBeEmpty();
    }

    private static BackupOptions CreateOptions(string workingDirectory)
        => new()
        {
            DatabaseUrl = "Host=localhost;Database=devinn;Username=postgres;Password=postgres",
            S3Endpoint = new Uri("https://example.r2.cloudflarestorage.com"),
            S3Bucket = "devinn-backups",
            S3AccessKeyId = "access",
            S3SecretAccessKey = "secret",
            WorkingDirectory = workingDirectory
        };

    private sealed class FakeDumpService : IDumpService
    {
        public bool FailValidation { get; init; }

        public Task CreateDumpAsync(PostgresConnectionSettings connection, string outputPath, CancellationToken cancellationToken)
        {
            File.WriteAllText(outputPath, "dump");
            return Task.CompletedTask;
        }

        public Task ValidateDumpAsync(string dumpPath, CancellationToken cancellationToken)
            => FailValidation
                ? throw new InvalidOperationException("invalid dump")
                : Task.CompletedTask;
    }

    private sealed class FakeStorage : IBackupStorage
    {
        public List<string> UploadedKeys { get; } = [];

        public Task UploadAsync(string key, string filePath, CancellationToken cancellationToken)
        {
            UploadedKeys.Add(key);
            return Task.CompletedTask;
        }

        public Task UploadJsonAsync<T>(string key, T content, CancellationToken cancellationToken)
        {
            UploadedKeys.Add(key);
            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<S3Object>> ListAsync(string prefix, CancellationToken cancellationToken)
            => Task.FromResult<IReadOnlyCollection<S3Object>>([]);

        public Task DeleteAsync(string key, CancellationToken cancellationToken)
            => Task.CompletedTask;
    }

    private sealed class TemporaryDirectory : IDisposable
    {
        public string Path { get; } = global::System.IO.Path.Combine(global::System.IO.Path.GetTempPath(), Guid.NewGuid().ToString("N"));

        public TemporaryDirectory()
            => Directory.CreateDirectory(Path);

        public void Dispose()
        {
            if (Directory.Exists(Path))
                Directory.Delete(Path, recursive: true);
        }
    }
}
