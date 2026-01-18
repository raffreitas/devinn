using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Financial;

public sealed class Expense : Entity
{
    public Guid CategoryId { get; private set; }
    public string Description { get; private set; }
    public Money Amount { get; private set; }
    public DateOnly DueDate { get; private set; }
    public DateOnly? PaymentDate { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public ExpenseStatus Status { get; private set; }

    public Expense(
        Guid categoryId,
        string description,
        Money amount,
        PaymentMethod paymentMethod,
        DateOnly dueDate,
        DateOnly? paymentDate
    )
    {
        if (amount <= 0)
            throw new DomainException("O valor da despesa deve ser maior que zero.");

        CategoryId = categoryId;
        Description = description;
        DueDate = dueDate;
        Amount = amount;
        PaymentMethod = paymentMethod;
        PaymentDate = paymentDate;
    }

    public bool IsOverdue(DateOnly referenceDate)
    {
        if (Status == ExpenseStatus.Paid) return false;
        return Status == ExpenseStatus.Pending && DueDate < referenceDate;
    }

    public bool IsDueToday(DateOnly referenceDate)
    {
        if (Status == ExpenseStatus.Paid) return false;
        return Status == ExpenseStatus.Pending && DueDate == referenceDate;
    }

    public void Update(
        Guid? categoryId = null,
        Money? amount = null,
        DateOnly? dueDate = null,
        string? description = null)
    {
        if (Status != ExpenseStatus.Pending)
        {
            throw new DomainException(
                "Não é permitido alterar uma despesa Paga ou Cancelada.");
        }

        Description = description ?? Description;
        Amount = amount ?? Amount;
        DueDate = dueDate ?? DueDate;
        CategoryId = categoryId ?? CategoryId;

        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsPaid(DateOnly paymentDate)
    {
        if (Status == ExpenseStatus.Cancelled) throw new DomainException("Não é possível pagar uma despesa cancelada.");
        if (Status == ExpenseStatus.Paid) return;

        Status = ExpenseStatus.Paid;
        PaymentDate = paymentDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == ExpenseStatus.Paid) throw new DomainException("Não é possível cancelar uma despesa já paga.");
        if (Status == ExpenseStatus.Cancelled) return;

        Status = ExpenseStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UnmarkAsPaid()
    {
        if (Status != ExpenseStatus.Paid) return;

        Status = ExpenseStatus.Pending;
        PaymentDate = null;
        UpdatedAt = DateTime.UtcNow;
    }
}