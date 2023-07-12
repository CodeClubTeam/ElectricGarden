using Microsoft.EntityFrameworkCore.Migrations;

namespace KioskApi.Migrations
{
    public partial class Sample_Co2Ppm : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "co2_ppm",
                table: "sample",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "co2_ppm",
                table: "sample");
        }
    }
}
