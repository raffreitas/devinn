using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Bookings.ValueObjects;

public sealed record Occupancy : IValueObject
{
    public int Adults { get; private init; }
    public int Children { get; private init; }
    public IReadOnlyCollection<int> ChildrenAges { get; private init; } = [];

    private Occupancy()
    {
    }

    public Occupancy(int adults, int children, IEnumerable<int>? childrenAges = null)
    {
        if (adults < 1)
            throw new DomainException("Deve haver pelo menos um adulto na ocupação.");
        if (children < 0)
            throw new DomainException("O número de crianças não pode ser negativo.");

        var ages = childrenAges?.ToList() ?? [];
        if (childrenAges != null && ages.Count != children)
            throw new DomainException("A lista de idades das crianças deve corresponder ao número de crianças.");

        Adults = adults;
        Children = children;
        ChildrenAges = ages.AsReadOnly();
    }
}