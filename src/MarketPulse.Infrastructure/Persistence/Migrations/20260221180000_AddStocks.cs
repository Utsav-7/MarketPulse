using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketPulse.Infrastructure.Persistence.Migrations
{
    public partial class AddStocks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ticker = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Exchange = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_Stocks", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_CountryCode",
                table: "Stocks",
                column: "CountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Ticker_CountryCode",
                table: "Stocks",
                columns: new[] { "Ticker", "CountryCode" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Stocks");
        }
    }
}
