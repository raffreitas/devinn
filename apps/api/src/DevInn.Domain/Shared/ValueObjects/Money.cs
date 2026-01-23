namespace DevInn.Domain.Shared.ValueObjects;

public readonly record struct Money(decimal Value)
{
    public static implicit operator decimal(Money money) => money.Value;
    public static implicit operator Money(decimal value) => new(value);
};