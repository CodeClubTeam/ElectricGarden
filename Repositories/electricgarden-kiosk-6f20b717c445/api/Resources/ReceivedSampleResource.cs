using System;

namespace KioskApi.Resources
{
    public class ReceivedSampleResource
    {
        public DateTimeOffset Timestamp { get; set; }

        public double? ProbeSoilTemp { get; set; }

        public double? ProbeAirTemp { get; set; }

        public double? ProbeMoisture { get; set; }

        public double? AmbientHumidity { get; set; }

        public double? BatteryVoltage { get; set; }

        public double? Light { get; set; }
        
        public double? Co2 { get; set; }

        public double? Rssi { get; set; }

        public double? Snr { get; set; }

        public byte? ErrorCode { get; set; }
    }
}