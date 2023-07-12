using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace KioskApi.Migrations
{
    public partial class Sample_Co2Rename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "co2_ppm",
                table: "sample",
                newName: "co2");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "co2",
                table: "sample",
                newName: "co2_ppm");

        }
    }
}
