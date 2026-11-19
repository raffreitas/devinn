using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Identity.Migrations
{
    /// <inheritdoc />
    public partial class V0003 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_login_at",
                schema: "identity",
                table: "asp_net_users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "last_login_at",
                schema: "identity",
                table: "asp_net_users");
        }
    }
}
