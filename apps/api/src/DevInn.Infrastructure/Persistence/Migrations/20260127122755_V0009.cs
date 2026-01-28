using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0009 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "channel_integration_id",
                table: "bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "external_id",
                table: "bookings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "channel_integrations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ical_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sync_status = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    inn_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_channel_integrations", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_channel_integration_id",
                table: "bookings",
                column: "channel_integration_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_external_id",
                table: "bookings",
                column: "external_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_channel_integrations_inn_id_is_active",
                table: "channel_integrations",
                columns: new[] { "inn_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_channel_integrations_room_id",
                table: "channel_integrations",
                column: "room_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "channel_integrations");

            migrationBuilder.DropIndex(
                name: "ix_bookings_channel_integration_id",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "ix_bookings_external_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "channel_integration_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "external_id",
                table: "bookings");
        }
    }
}
