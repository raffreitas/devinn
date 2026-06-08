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
            migrationBuilder.AddColumn<string>(
                name: "reconciliation_status",
                table: "bookings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
            
            migrationBuilder.Sql("""
                                 UPDATE bookings
                                 SET reconciliation_status = CASE
                                     WHEN guest_name IS NULL AND total_value = 0 THEN 'NeedsReview'
                                     ELSE 'Reconciled'
                                 END
                                 WHERE source IN ('BookingIcal', 'AirbnbIcal')
                                   AND deleted_at IS NULL
                                   AND status <> 'Canceled';
                                 """);

            migrationBuilder.CreateIndex(
                name: "ix_bookings_reconciliation_status",
                table: "bookings",
                column: "reconciliation_status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_bookings_reconciliation_status",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "reconciliation_status",
                table: "bookings");
        }
    }
}
