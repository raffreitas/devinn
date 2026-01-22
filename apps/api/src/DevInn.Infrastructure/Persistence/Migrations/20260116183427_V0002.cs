using System;

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0002 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guest_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    guest_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    guest_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    guest_document = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    guest_birth_date = table.Column<DateTime>(type: "date", nullable: true),
                    adults = table.Column<int>(type: "integer", nullable: false),
                    children = table.Column<int>(type: "integer", nullable: false),
                    children_ages = table.Column<string>(type: "jsonb", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    total_value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    paid_value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    check_in = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    check_out = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    inn_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                    table.ForeignKey(
                        name: "fk_bookings_inns_inn_id",
                        column: x => x.inn_id,
                        principalTable: "inns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bookings_rooms_room_id",
                        column: x => x.room_id,
                        principalTable: "rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create performant DB-level indexes using native SQL to allow INCLUDE columns and precise control
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS idx_booking_dates ON bookings (room_id) INCLUDE (check_in, check_out);");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS idx_booking_financial ON bookings (inn_id, total_value, paid_value) INCLUDE (check_in, check_out);");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS idx_booking_inn ON bookings (inn_id);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop custom indexes created with raw SQL
            migrationBuilder.Sql("DROP INDEX IF EXISTS idx_booking_dates;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS idx_booking_financial;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS idx_booking_inn;");

            migrationBuilder.DropTable(
                name: "bookings");
        }
    }
}