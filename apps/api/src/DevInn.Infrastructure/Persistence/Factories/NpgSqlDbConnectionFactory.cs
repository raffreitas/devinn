using System.Data.Common;

using DevInn.Application.Common.Data.Abstractions;

using Npgsql;

namespace DevInn.Infrastructure.Persistence.Factories;

internal sealed class DbConnectionFactory(NpgsqlDataSource dataSource) : IDbConnectionFactory
{
    public async ValueTask<DbConnection> OpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        return await dataSource.OpenConnectionAsync(cancellationToken);
    }
}