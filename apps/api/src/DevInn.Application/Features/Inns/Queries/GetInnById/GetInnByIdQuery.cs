using DevInn.Application.Features.Inns.Shared.DTOs;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Queries.GetInnById;

public sealed record GetInnByIdQuery(Guid Id) : IQuery<Result<InnDto>>;