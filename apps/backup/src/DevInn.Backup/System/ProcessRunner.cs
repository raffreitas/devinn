using System.Diagnostics;

namespace DevInn.Backup.System;

internal sealed class ProcessRunner
{
    public async Task RunAsync(
        string fileName,
        string arguments,
        IReadOnlyDictionary<string, string>? environment,
        TimeSpan timeout,
        CancellationToken cancellationToken)
    {
        using var process = new Process();
        process.StartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        if (environment is not null)
        {
            foreach (var (key, value) in environment)
                process.StartInfo.Environment[key] = value;
        }

        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var stderrTask = process.StandardError.ReadToEndAsync(cancellationToken);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        try
        {
            await process.WaitForExitAsync(timeoutCts.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            TryKill(process);
            throw new TimeoutException($"{fileName} did not finish within {timeout.TotalMinutes:N0} minute(s).");
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;

        if (process.ExitCode != 0)
        {
            var message = string.IsNullOrWhiteSpace(stderr)
                ? stdout
                : stderr;

            throw new InvalidOperationException($"{fileName} failed with exit code {process.ExitCode}: {message}");
        }
    }

    private static void TryKill(Process process)
    {
        if (process.HasExited)
            return;

        try
        {
            process.Kill(entireProcessTree: true);
        }
        catch
        {
            // Best effort termination after timeout.
        }
    }
}
