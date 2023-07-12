namespace KioskApi.Resources
{
    public class DeviceSamplesResource
    {
        public DeviceInstallationResource Sensor { get; set; }
        
        public DateRange DateRange { get; set; }
        
        public SampleResource[] Samples { get; set; }
    }
}