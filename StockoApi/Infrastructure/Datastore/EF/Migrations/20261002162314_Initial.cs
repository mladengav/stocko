using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockoApi.Infrastructure.Datastore.EF.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "stocko");

            migrationBuilder.CreateTable(
                name: "TickerSnapshots",
                schema: "stocko",
                columns: table => new
                {
                    SnapshotDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SectorKey = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IndustryKey = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ExDividendDate = table.Column<DateOnly>(type: "date", nullable: true),
                    LastDividendDate = table.Column<DateOnly>(type: "date", nullable: false),
                    LongName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RegularMarketPrice = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    RegularMarketTime = table.Column<long>(type: "bigint", nullable: false),
                    DividendRate = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    DividendYield = table.Column<double>(type: "float", nullable: false),
                    MarketCap = table.Column<long>(type: "bigint", nullable: false),
                    PayoutRatio = table.Column<double>(type: "float", nullable: false),
                    HeldPercentInsiders = table.Column<double>(type: "float", nullable: false),
                    HeldPercentInstitutions = table.Column<double>(type: "float", nullable: false),
                    QuoteType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TypeDisp = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LastDividendDecrease = table.Column<DateOnly>(type: "date", nullable: false),
                    YearsSinceDividendDecrease = table.Column<int>(type: "int", nullable: false),
                    YearsConsecutiveDividendIncrease = table.Column<int>(type: "int", nullable: false),
                    TtmDivs = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TickerSnapshots", x => new { x.Symbol, x.SnapshotDate });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TickerSnapshots",
                schema: "stocko");
        }
    }
}
