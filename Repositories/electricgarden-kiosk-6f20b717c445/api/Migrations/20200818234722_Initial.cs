using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace KioskApi.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "device_installation",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    serial = table.Column<string>(maxLength: 8, nullable: false),
                    title = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_device_installation", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sample",
                columns: table => new
                {
                    installation_id = table.Column<int>(nullable: false),
                    timestamp = table.Column<DateTimeOffset>(nullable: false),
                    probe_soil_temp = table.Column<double>(nullable: true),
                    probe_air_temp = table.Column<double>(nullable: true),
                    probe_moisture = table.Column<double>(nullable: true),
                    ambient_humidity = table.Column<double>(nullable: true),
                    battery_voltage = table.Column<double>(nullable: true),
                    light = table.Column<double>(nullable: true),
                    rssi = table.Column<double>(nullable: true),
                    snr = table.Column<double>(nullable: true),
                    error_code = table.Column<byte>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sample", x => new { x.installation_id, x.timestamp });
                    table.ForeignKey(
                        name: "fk_sample_device_installation_installation_id",
                        column: x => x.installation_id,
                        principalTable: "device_installation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sample");

            migrationBuilder.DropTable(
                name: "device_installation");
        }
    }
}
