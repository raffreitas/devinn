using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Financial;

public sealed class ExpenseCategory : Entity
{
    public string Name { get; private set; }

    public ExpenseCategory(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("O nome da categoria de despesa não pode ser vazio.");

        Name = name;
    }
}