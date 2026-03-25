using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.ProcessRecurringExpense;

public sealed record ProcessRecurringExpenseCommand(Guid RecurringExpenseId) : ICommand<Result<int>>;