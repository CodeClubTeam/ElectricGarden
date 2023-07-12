using System;
using System.Threading;
using System.Threading.Tasks;
using AzureFunctions.Extensions.Swashbuckle.Attribute;
using KioskApi.Models;
using KioskApi.Persistence;
using KioskApi.Resources;
using KioskApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace KioskApi.Handlers
{
    /// <summary>
    ///     Handler for samples from Device HQ.
    /// </summary>
    /// <remarks>
    ///     Based on serial number.
    ///     Has to match Device HQ expectations for a sample receiver.
    /// </remarks>
    public class SampleReceivingHandler
    {
        private readonly AppDbContext _dbContext;
        private readonly UnhandledExceptionReporter _exceptionReporter;

        public SampleReceivingHandler(AppDbContext dbContext, UnhandledExceptionReporter exceptionReporter)
        {
            _dbContext = dbContext;
            _exceptionReporter = exceptionReporter;
        }

        [FunctionName("ReceiveSamples")]
        public async Task<IActionResult> Post(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "samples/{serial}")]
            [RequestBodyType(typeof(ReceivedSampleResource), "sample")]
            ReceivedSampleResource resource,
            ILogger log,
            string serial,
            CancellationToken cancellationToken)
        {
            try
            {
                log.LogInformation("POST", resource);

                var sample = await _dbContext.Samples.SingleOrDefaultAsync(s =>
                                 s.Installation.Serial == serial && s.Timestamp == resource.Timestamp, cancellationToken: cancellationToken);
                if (sample == null)
                {
                    var install =
                        await _dbContext.DeviceInstallations.SingleOrDefaultAsync(x => x.Serial == serial,
                            cancellationToken);
   
                    if (install == null)
                    {
                        log.LogInformation($"No install registered with serial: ${serial}. Auto-registering.");
                        install = new DeviceInstallation
                        {
                            Serial = serial,
                            Title = $"Device: {serial}"
                        };
                        _dbContext.DeviceInstallations.Add(install);
                    }
                    sample = new Sample(install, resource.Timestamp);
                    _dbContext.Samples.Add(sample);
                }

                sample.ProbeAirTemp = resource.ProbeAirTemp;
                sample.ProbeSoilTemp = resource.ProbeSoilTemp;
                sample.ProbeMoisture = resource.ProbeMoisture;
                sample.AmbientHumidity = resource.AmbientHumidity;
                sample.Light = resource.Light;
                sample.Co2 = resource.Co2;
                
                sample.BatteryVoltage = resource.BatteryVoltage;
                sample.Rssi = resource.Rssi;
                sample.Snr = resource.Snr;
                sample.ErrorCode = resource.ErrorCode;
                try
                {
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException ex)
                {
                    
                    // TODO: verify is validation error not sql ex
                    return new BadRequestObjectResult(ex);
                }
                
                return new AcceptedResult();
            }
            catch (Exception ex)
            {
                _exceptionReporter.ReportException(ex);
                throw;
            }
        }
    }
}