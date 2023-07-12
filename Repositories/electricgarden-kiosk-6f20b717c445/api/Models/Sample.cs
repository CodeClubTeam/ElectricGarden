using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KioskApi.Models
{
    [Table("sample")]
    public class Sample
    {
        public Sample(DeviceInstallation install, DateTimeOffset timestamp)
        {
            Installation = install;
            Timestamp = timestamp;
        }

        protected Sample()
        {
        }

        [Required] public int InstallationId { get; protected set; }

        public virtual DeviceInstallation Installation { get; protected set; }

        [Required] public DateTimeOffset Timestamp { get; protected set; }

        public double? ProbeSoilTemp { get; set; }

        public double? ProbeAirTemp { get; set; }

        public double? ProbeMoisture { get; set; }

        public double? AmbientHumidity { get; set; }

        public double? BatteryVoltage { get; set; }

        public double? Light { get; set; }

        public double? Rssi { get; set; }

        public double? Snr { get; set; }
        
        public double? Co2 { get; set; }

        public byte? ErrorCode { get; set; }
    }
}