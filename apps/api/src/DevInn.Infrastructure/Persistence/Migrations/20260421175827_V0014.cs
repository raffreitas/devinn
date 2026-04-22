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
            migrationBuilder.Sql("""
                                 DROP INDEX IF EXISTS ix_bookings_inn_id;
                                 DROP INDEX IF EXISTS ix_bookings_room_id;

                                 ALTER TABLE bookings
                                 ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

                                 ALTER TABLE bookings
                                 ADD COLUMN IF NOT EXISTS deleted_by uuid;
                                 """);

            // The exclusion constraint below depends on btree_gist support in the target PostgreSQL instance.
            migrationBuilder.Sql("""
                                 CREATE EXTENSION IF NOT EXISTS btree_gist;
                                 """);

            migrationBuilder.Sql("""
                                 CREATE TABLE IF NOT EXISTS audit_logs (
                                     id uuid PRIMARY KEY,
                                     inn_id uuid NOT NULL,
                                     module character varying(50) NOT NULL,
                                     entity_name character varying(100) NOT NULL,
                                     entity_id uuid NOT NULL,
                                     action character varying(50) NOT NULL,
                                     actor_id uuid NULL,
                                     summary character varying(500) NOT NULL,
                                     changes jsonb NULL,
                                     occurred_at timestamp with time zone NOT NULL
                                 );

                                 CREATE INDEX IF NOT EXISTS ix_bookings_inn_id_deleted_at
                                     ON bookings (inn_id, deleted_at);

                                 CREATE INDEX IF NOT EXISTS ix_bookings_room_id_deleted_at_status
                                     ON bookings (room_id, deleted_at, status);

                                 CREATE INDEX IF NOT EXISTS ix_audit_logs_inn_id_entity_name_entity_id_occurred_at
                                     ON audit_logs (inn_id, entity_name, entity_id, occurred_at);

                                 CREATE INDEX IF NOT EXISTS ix_audit_logs_inn_id_module_occurred_at
                                     ON audit_logs (inn_id, module, occurred_at);

                                 ALTER TABLE bookings
                                 DROP CONSTRAINT IF EXISTS bookings_no_overlapping_stays;

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
