using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Converters;

/// <summary>
/// Converts DateOnly? to DateTime? for database storage.
/// PostgreSQL does not have a DateOnly type, so we store it as DateTime with time set to midnight.
/// </summary>
internal sealed class DateOnlyToDateTimeConverter() : ValueConverter<DateOnly?, DateTime?>(
    d => d.HasValue ? d.Value.ToDateTime(TimeOnly.MinValue) : null,
    dt => dt.HasValue ? DateOnly.FromDateTime(dt.Value) : null);