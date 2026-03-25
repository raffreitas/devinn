using DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenses;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Financial.RecurringExpenses.GetRecurringExpenseById;

public sealed record GetRecurringExpenseByIdQuery(Guid Id) : IQuery<Result<RecurringExpenseResponse>>;