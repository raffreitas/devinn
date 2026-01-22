using DevInn.Domain.Shared.ValueObjects;

using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Converters;

/// <summary>
/// Converts Money to decimal for database storage.
/// </summary>
internal sealed class MoneyToDecimalConverter() : ValueConverter<Money, decimal>(
    m => m.Value,
    d => new Money(d));