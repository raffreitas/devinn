using System.Diagnostics.Metrics;

namespace DevInn.Backup.Observability;

internal sealed class BackupMetrics : IDisposable
{
    public const string MeterName = "DevInn.Backup";

    private readonly Meter _meter = new(MeterName);
    private readonly Counter<long> _completed;
    private readonly Counter<long> _failed;
    private readonly Histogram<double> _duration;
    private readonly Histogram<long> _size;
    private readonly Counter<long> _deleted;
    private readonly ObservableGauge<long> _lastSuccessAgeSeconds;

    private long _lastSuccessUnixTimeSeconds;

    public BackupMetrics()
    {
        _completed = _meter.CreateCounter<long>("devinn_backup_completed_total");
        _failed = _meter.CreateCounter<long>("devinn_backup_failed_total");
        _duration = _meter.CreateHistogram<double>("devinn_backup_duration_ms");
        _size = _meter.CreateHistogram<long>("devinn_backup_size_bytes");
        _deleted = _meter.CreateCounter<long>("devinn_backup_deleted_expired_total");
        _lastSuccessAgeSeconds = _meter.CreateObservableGauge(
            "devinn_backup_last_success_age_seconds",
            ObserveLastSuccessAgeSeconds);
    }

    public void RecordSuccess(TimeSpan duration, long sizeBytes, int deletedExpiredCount)
    {
        _lastSuccessUnixTimeSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _completed.Add(1);
        _duration.Record(duration.TotalMilliseconds);
        _size.Record(sizeBytes);
        _deleted.Add(deletedExpiredCount);
    }

    public void RecordFailure()
        => _failed.Add(1);

    public void Dispose()
        => _meter.Dispose();

    private Measurement<long> ObserveLastSuccessAgeSeconds()
    {
        if (_lastSuccessUnixTimeSeconds == 0)
            return new Measurement<long>(-1);

        return new Measurement<long>(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - _lastSuccessUnixTimeSeconds);
    }
}
