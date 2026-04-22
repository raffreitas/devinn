using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0014 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_bookings_inn_id",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "ix_bookings_room_id",
                table: "bookings");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at",
                table: "bookings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "deleted_by",
                table: "bookings",
                type: "uuid",
                nullable: true);

            // The exclusion constraint below depends on btree_gist support in the target PostgreSQL instance.
            migrationBuilder.Sql("""
                                 CREATE EXTENSION IF NOT EXISTS btree_gist;
                                 """);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    inn_id = table.Column<Guid>(type: "uuid", nullable: false),
                    module = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    actor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    summary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    changes = table.Column<string>(type: "jsonb", nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_inn_id_deleted_at",
                table: "bookings",
                columns: new[] { "inn_id", "deleted_at" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_room_id_deleted_at_status",
                table: "bookings",
                columns: new[] { "room_id", "deleted_at", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_inn_id_entity_name_entity_id_occurred_at",
                table: "audit_logs",
                columns: new[] { "inn_id", "entity_name", "entity_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_inn_id_module_occurred_at",
                table: "audit_logs",
                columns: new[] { "inn_id", "module", "occurred_at" });

            migrationBuilder.Sql("""
                                 ALTER TABLE bookings
                                 ADD CONSTRAINT bookings_no_overlapping_stays
                                 EXCLUDE USING gist (
                                     room_id WITH =,
                                     tstzrange(check_in, check_out, '[)') WITH &&
                                 )
                                 WHERE (deleted_at IS NULL AND status <> 'Canceled');
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                 ALTER TABLE bookings
                                 DROP CONSTRAINT IF EXISTS bookings_no_overlapping_stays;
                                 """);

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropIndex(
                name: "ix_bookings_inn_id_deleted_at",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "ix_bookings_room_id_deleted_at_status",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "deleted_by",
                table: "bookings");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_inn_id",
                table: "bookings",
                column: "inn_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_room_id",
                table: "bookings",
                column: "room_id");
        }
    }
}
