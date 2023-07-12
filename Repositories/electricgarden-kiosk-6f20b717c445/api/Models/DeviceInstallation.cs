using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KioskApi.Models
{
    [Table("device_installation")]
    public class DeviceInstallation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; protected set; }

        [Required]
        [MaxLength(Constants.SerialMaxLength)]
        public string Serial { get; set; }

        [Required] public string Title { get; set; }
    }
}