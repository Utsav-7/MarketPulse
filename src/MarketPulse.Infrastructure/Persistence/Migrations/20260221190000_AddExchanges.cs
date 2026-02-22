using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketPulse.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Creates the Exchanges table. If your database already has this table (e.g. from running the SQL script),
    /// add a row to __EFMigrationsHistory with MigrationId = '20260221190000_AddExchanges' and do not run Up().
    /// </summary>
    public partial class AddExchanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exchanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Mic = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Timezone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PreMarket = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Hour = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    PostMarket = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CloseDate = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    CountryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Reference = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true)
                },
                constraints: table => table.PrimaryKey("PK_Exchanges", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_Exchanges_Code",
                table: "Exchanges",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Exchanges_Country",
                table: "Exchanges",
                column: "Country");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Exchanges");
        }
    }
}
