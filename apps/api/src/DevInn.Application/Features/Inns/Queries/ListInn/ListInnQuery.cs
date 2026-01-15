using DevInn.Application.Features.Inns.Shared.DTOs;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Queries.ListInn;

public record ListInnQuery : IQuery<Result<InnDto[]>>;