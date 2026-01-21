using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0005 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_rooms_category_id",
                table: "rooms");

            migrationBuilder.CreateIndex(
                name: "ix_rooms_category_id",
                table: "rooms",
                column: "category_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_rooms_category_id",
                table: "rooms");

            migrationBuilder.CreateIndex(
                name: "ix_rooms_category_id",
                table: "rooms",
                column: "category_id",
                unique: true);
        }
    }
}
