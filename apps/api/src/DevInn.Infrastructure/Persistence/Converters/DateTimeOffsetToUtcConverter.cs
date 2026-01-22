using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Converters;

/// <summary>
/// Converts DateTimeOffset to UTC when saving to PostgreSQL and keeps as UTC when reading.
/// PostgreSQL timestamp with time zone only supports UTC offset (0).
/// </summary>
internal sealed class DateTimeOffsetToUtcConverter() : ValueConverter<DateTimeOffset, DateTimeOffset>(
    v => v.ToUniversalTime(),
    v => v.ToUniversalTime());