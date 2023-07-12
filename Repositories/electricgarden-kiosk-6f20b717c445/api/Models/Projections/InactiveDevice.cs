using System;

namespace KioskApi.Models.Projections
{
    public class InactiveDevice
    {
        public int Id { get; set; }
        public string Serial { get; set; }
        public string Title { get; set; }
        public DateTimeOffset LastHeardFrom { get; set; }
    }
}