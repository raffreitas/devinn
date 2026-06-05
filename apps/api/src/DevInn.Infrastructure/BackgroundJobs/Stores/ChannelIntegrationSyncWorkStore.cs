using Dapper;

using DevInn.Application.Common.Data.Abstractions;

namespace DevInn.Infrastructure.BackgroundJobs.Stores;

internal sealed class ChannelIntegrationSyncWorkStore(IDbConnectionFactory dbConnectionFactory)
    : IChannelIntegrationSyncWorkStore
{
    public async Task<IReadOnlyList<ChannelIntegrationSyncWorkItem>> ClaimDueAsync(
        int batchSize,
        CancellationToken cancellationToken = default)
    {
        const string query = """
                             WITH due_integrations AS (
                                 SELECT id
                                 FROM channel_integrations
                                 WHERE is_active = true
                                   AND (
                                       sync_status->>'status' IN ('NeverSynced', 'Failed')
                                       OR (
                                           sync_status->>'nextSyncAt' IS NOT NULL
                                           AND (sync_status->>'nextSyncAt')::timestamptz <= now()
                                       )
                                   )
                                 ORDER BY updated_at
                                 FOR UPDATE SKIP LOCKED
                                 LIMIT @BatchSize
                             )
                             UPDATE channel_integrations AS ci
                             SET sync_status = jsonb_build_object(
                                     'status', 'Syncing',
                                     'lastSyncAt', NULL,
                                     'nextSyncAt', NULL,
                                     'errorMessage', NULL,
                                     'importedBookingsCount', 0
                                 ),
                                 updated_at = now()
                             FROM due_integrations
                             WHERE ci.id = due_integrations.id
                             RETURNING ci.id AS "Id", ci.room_id AS "RoomId", ci.inn_id AS "InnId";
                             """;

        await using var dbConnection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        await using var transaction = await dbConnection.BeginTransactionAsync(cancellationToken);

        var command = new CommandDefinition(
            query,
            new { BatchSize = batchSize },
            transaction,
            cancellationToken: cancellationToken);

        var integrations = (await dbConnection.QueryAsync<ChannelIntegrationSyncWorkItem>(command)).AsList();
        await transaction.CommitAsync(cancellationToken);

        return integrations;
    }
}