using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0011 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ical_export_token",
                table: "rooms",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """
                update rooms
                set ical_export_token = substring(md5(random()::text || clock_timestamp()::text) from 1 for 64)
                where ical_export_token = '';

                create unique index idx_rooms_ical_export_token
                on rooms (ical_export_token);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("drop index idx_rooms_ical_export_token;");
            
            migrationBuilder.DropColumn(
                name: "ical_export_token",
                table: "rooms");
        }
    }
}
