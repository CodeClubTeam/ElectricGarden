using KioskApi.Models;
using KioskApi.Models.Projections;
using Microsoft.EntityFrameworkCore;

namespace KioskApi.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<DeviceInstallation> DeviceInstallations { get; set; }

        public DbSet<Sample> Samples { get; set; }

        public DbSet<InactiveDevice> InactiveDevices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Sample>().HasKey(m => new {m.InstallationId, m.Timestamp});
            modelBuilder.Entity<DeviceInstallation>().HasIndex(m => m.Serial).IsUnique();

            // projections
            modelBuilder.Entity<InactiveDevice>().HasNoKey();
        }
    }
}