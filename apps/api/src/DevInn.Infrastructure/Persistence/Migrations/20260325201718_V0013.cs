using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevInn.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V0013 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "recurring_expense_id",
                table: "expenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "recurring_expenses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    payment_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    start_date = table.Column<DateTime>(type: "date", nullable: false),
                    day_of_month = table.Column<int>(type: "integer", nullable: false),
                    end_date = table.Column<DateTime>(type: "date", nullable: true),
                    max_occurrences = table.Column<int>(type: "integer", nullable: true),
                    last_generated_due_date = table.Column<DateTime>(type: "date", nullable: true),
                    generated_occurrences_count = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    inn_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recurring_expenses", x => x.id);
                    table.ForeignKey(
                        name: "fk_recurring_expenses_expense_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "expense_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_expenses_recurring_expense_id",
                table: "expenses",
                column: "recurring_expense_id");

            migrationBuilder.CreateIndex(
                name: "ix_recurring_expenses_category_id",
                table: "recurring_expenses",
                column: "category_id");

            migrationBuilder.AddForeignKey(
                name: "fk_expenses_recurring_expenses_recurring_expense_id",
                table: "expenses",
                column: "recurring_expense_id",
                principalTable: "recurring_expenses",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_expenses_recurring_expenses_recurring_expense_id",
                table: "expenses");

            migrationBuilder.DropTable(
                name: "recurring_expenses");

            migrationBuilder.DropIndex(
                name: "ix_expenses_recurring_expense_id",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "recurring_expense_id",
                table: "expenses");
        }
    }
}
