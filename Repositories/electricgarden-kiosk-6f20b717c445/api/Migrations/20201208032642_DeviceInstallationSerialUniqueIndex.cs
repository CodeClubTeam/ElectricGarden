using Microsoft.EntityFrameworkCore.Migrations;

namespace KioskApi.Migrations
{
    public partial class DeviceInstallationSerialUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_device_installation_serial",
                table: "device_installation",
                column: "serial",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_device_installation_serial",
                table: "device_installation");
        }
    }
}
