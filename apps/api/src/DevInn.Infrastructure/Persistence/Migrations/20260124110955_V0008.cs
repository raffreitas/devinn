using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0008 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "row_version",
                table: "expense_categories",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "row_version",
                table: "bookings",
                type: "bytea",
                rowVersion: true,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "row_version",
                table: "expense_categories");

            migrationBuilder.DropColumn(
                name: "row_version",
                table: "bookings");
        }
    }
}