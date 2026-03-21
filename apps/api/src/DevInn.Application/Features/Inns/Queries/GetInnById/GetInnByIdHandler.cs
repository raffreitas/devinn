using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Application.Features.Inns.Shared.DTOs;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inns.Queries.GetInnById;

internal sealed class GetInnByIdHandler(IDbConnectionFactory dbConnectionFactory, ITenantContext tenantContext)
    : IQueryHandler<GetInnByIdQuery, Result<InnDto>>
{
    public async ValueTask<Result<InnDto>> Handle(GetInnByIdQuery query, CancellationToken cancellationToken)
    {
        const string sql = """
SELECT
    id AS "Id",
    name AS "Name",
    address AS "Address",
    city AS "City",
    state AS "State",
    country AS "Country",
    zip_code AS "ZipCode",
    phone AS "Phone",
    email AS "Email"
FROM public.inns
WHERE id = @Id
  AND id = @TenantId
""";
        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var innDto = await connection.QueryFirstOrDefaultAsync<InnDto>(
            sql,
            new { query.Id, TenantId = tenantContext.Tenant.Id });

        if (innDto is null)
            return Result.Fail(new NotFoundError("Pousada não encontrada."));

        return innDto;
    }
}
