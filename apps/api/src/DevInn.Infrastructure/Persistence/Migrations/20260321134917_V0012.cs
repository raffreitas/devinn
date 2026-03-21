using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0012 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "zip_code",
                table: "inns",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "zip_code",
                table: "inns");
        }
    }
}
