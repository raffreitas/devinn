using DevInn.Application.Features.Inns.Shared.DTOs;
using DevInn.Domain.Aggregates.Inns.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Queries.ListInn;

internal sealed class ListInnHandler(IInnRepository innRepository) : IQueryHandler<ListInnQuery, Result<InnDto[]>>
{
    public async ValueTask<Result<InnDto[]>> Handle(ListInnQuery query, CancellationToken cancellationToken)
    {
        var inns = await innRepository.GetAllAsync(cancellationToken);
        return inns.Select(inn => new InnDto(
            inn.Id,
            inn.Name,
            inn.Address,
            inn.City,
            inn.Country,
            inn.Phone,
            inn.Email
        )).ToArray();
    }
}