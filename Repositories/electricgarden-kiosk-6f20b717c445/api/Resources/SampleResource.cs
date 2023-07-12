using System;

namespace KioskApi.Resources
{
    public class SampleResource
    {
        public DateTimeOffset Timestamp { get; set; }
        
        public double? AirTemp { get; set; }
        
        public double? SoilTemp { get; set; }
        
        public double? SoilMoisture { get; set; }
        
        public double? Humidity { get; set; }
        
        public double? Light { get; set; }
        
        public double? Co2 { get; set; }
    }
}