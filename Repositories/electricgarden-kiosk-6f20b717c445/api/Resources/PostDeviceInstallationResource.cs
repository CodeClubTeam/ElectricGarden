using System.ComponentModel.DataAnnotations;

namespace KioskApi.Resources
{
    public class PostDeviceInstallationResource
    {
        [Required]
        public string Serial { get; set; }
        
        [Required]
        public string Title { get; set; }
    }
}