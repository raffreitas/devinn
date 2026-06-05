using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0015 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                 CREATE INDEX IF NOT EXISTS ix_channel_integrations_active_sync_due
                                 ON channel_integrations (
                                     is_active,
                                     ((sync_status->>'status')),
                                     updated_at
                                 )
                                 WHERE is_active = true;
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                 DROP INDEX IF EXISTS ix_channel_integrations_active_sync_due;
                                 """);
        }
    }
}
