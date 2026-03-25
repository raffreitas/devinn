using DevInn.Domain.Aggregates.Financial.Enums;
using DevInn.Domain.SeedWork;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;

namespace DevInn.Domain.Aggregates.Financial;

public sealed class RecurringExpense : Entity
{
    public Guid CategoryId { get; private set; }
    public string Description { get; private set; }
    public Money Amount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public DateOnly StartDate { get; private set; }
    public int DayOfMonth { get; private set; }
    public DateOnly? EndDate { get; private set; }
    public int? MaxOccurrences { get; private set; }
    public DateOnly? LastGeneratedDueDate { get; private set; }
    public int GeneratedOccurrencesCount { get; private set; }
    public RecurringExpenseStatus Status { get; private set; }

    public RecurringExpense(
        Guid categoryId,
        string description,
        Money amount,
        PaymentMethod paymentMethod,
        DateOnly startDate,
        DateOnly? endDate = null,
        int? maxOccurrences = null)
    {
        if (amount <= 0)
            throw new DomainException("O valor da despesa recorrente deve ser maior que zero.");

        if (endDate.HasValue && endDate.Value < startDate)
            throw new DomainException("A data final não pode ser anterior à data inicial.");

        if (maxOccurrences.HasValue && maxOccurrences.Value <= 0)
            throw new DomainException("A quantidade máxima de ocorrências deve ser maior que zero.");

        CategoryId = categoryId;
        Description = description;
        Amount = amount;
        PaymentMethod = paymentMethod;
        StartDate = startDate;
        DayOfMonth = startDate.Day;
        EndDate = endDate;
        MaxOccurrences = maxOccurrences;
        Status = RecurringExpenseStatus.Active;
    }

    public DateOnly GetNextDueDate()
    {
        var referenceDate = LastGeneratedDueDate ?? StartDate;
        return LastGeneratedDueDate is null ? referenceDate : CreateDueDate(referenceDate.AddMonths(1));
    }

    public bool ShouldGenerate(DateOnly referenceDate)
    {
        if (Status != RecurringExpenseStatus.Active)
            return false;

        var nextDueDate = GetNextDueDate();
        if (nextDueDate > referenceDate)
            return false;

        if (EndDate.HasValue && nextDueDate > EndDate.Value)
            return false;

        return !MaxOccurrences.HasValue || GeneratedOccurrencesCount < MaxOccurrences.Value;
    }

    public void RegisterGeneratedOccurrence(DateOnly dueDate)
    {
        if (Status != RecurringExpenseStatus.Active)
            throw new DomainException("Não é possível gerar ocorrências para uma recorrência inativa.");

        LastGeneratedDueDate = dueDate;
        GeneratedOccurrencesCount++;
        UpdatedAt = DateTimeOffset.UtcNow;

        if (EndDate.HasValue && GetNextDueDate() > EndDate.Value)
        {
            Status = RecurringExpenseStatus.Completed;
        }

        if (GeneratedOccurrencesCount >= MaxOccurrences)
        {
            Status = RecurringExpenseStatus.Completed;
        }
    }

    public void Update(
        Guid? categoryId = null,
        string? description = null,
        Money? amount = null,
        PaymentMethod? paymentMethod = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        int? maxOccurrences = null)
    {
        if (Status != RecurringExpenseStatus.Active)
            throw new DomainException("Não é permitido alterar uma recorrência cancelada ou concluída.");

        var nextStartDate = startDate ?? StartDate;
        var nextEndDate = endDate ?? EndDate;
        var nextMaxOccurrences = maxOccurrences ?? MaxOccurrences;

        if (nextEndDate.HasValue && nextEndDate.Value < nextStartDate)
            throw new DomainException("A data final não pode ser anterior à data inicial.");

        if (nextMaxOccurrences.HasValue && nextMaxOccurrences.Value <= 0)
            throw new DomainException("A quantidade máxima de ocorrências deve ser maior que zero.");

        CategoryId = categoryId ?? CategoryId;
        Description = description ?? Description;
        Amount = amount ?? Amount;
        PaymentMethod = paymentMethod ?? PaymentMethod;
        StartDate = nextStartDate;
        DayOfMonth = StartDate.Day;
        EndDate = nextEndDate;
        MaxOccurrences = nextMaxOccurrences;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Cancel()
    {
        if (Status == RecurringExpenseStatus.Completed)
            throw new DomainException("Não é possível cancelar uma recorrência já concluída.");

        if (Status == RecurringExpenseStatus.Cancelled)
            return;

        Status = RecurringExpenseStatus.Cancelled;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    private DateOnly CreateDueDate(DateOnly monthReference)
    {
        var day = Math.Min(DayOfMonth, DateTime.DaysInMonth(monthReference.Year, monthReference.Month));
        return new DateOnly(monthReference.Year, monthReference.Month, day);
    }
}