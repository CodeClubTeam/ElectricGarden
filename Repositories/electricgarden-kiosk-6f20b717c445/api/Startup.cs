using System;
using System.Reflection;
using AzureFunctions.Extensions.Swashbuckle;
using KioskApi;
using KioskApi.Persistence;
using KioskApi.Services;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Startup))]

namespace KioskApi
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
                if (connectionString == null) throw new Exception("No connection string found");
                options.UseSqlServer(connectionString);
                options.UseSnakeCaseNamingConvention();
            });
            builder.AddSwashBuckle(Assembly.GetExecutingAssembly(), opts =>
            {
                opts.XmlPath = "KioskApi.xml";
            });
            builder.Services.AddSingleton<UnhandledExceptionReporter>();
        }
    }
}