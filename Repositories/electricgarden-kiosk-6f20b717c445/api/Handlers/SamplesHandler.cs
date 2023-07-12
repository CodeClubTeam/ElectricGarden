using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using AzureFunctions.Extensions.Swashbuckle.Attribute;
using KioskApi.Persistence;
using KioskApi.Resources;
using KioskApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace KioskApi.Handlers
{
    public class SamplesHandler
    {
        private static readonly JsonSerializerSettings JsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        private readonly AppDbContext _dbContext;
        private readonly UnhandledExceptionReporter _exceptionReporter;

        public SamplesHandler(AppDbContext dbContext, UnhandledExceptionReporter exceptionReporter)
        {
            _dbContext = dbContext;
            _exceptionReporter = exceptionReporter;
        }

        [FunctionName("GetSamples")]
        [ProducesResponseType(typeof(DeviceSamplesResource), (int) HttpStatusCode.OK)]
        [QueryStringParameter("from", "from timestamp", DataType = typeof(DateTimeOffset), Required = false)]
        [QueryStringParameter("to", "to timestamp", DataType = typeof(DateTimeOffset), Required = false)]
        public async Task<IActionResult> Get(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "samples/{id:int}")]
            [RequestBodyType(typeof(void), "None")]
            HttpRequest req,
            ILogger log,
            int id,
            CancellationToken cancellationToken)
        {
            try
            {
                log.LogInformation($"GET {id}");

                var fromTimestamp = DateTimeOffset.Now.Subtract(TimeSpan.FromDays(1));
                if (req.Query.ContainsKey("from") && req.Query["from"].Count == 1)
                    if (!DateTimeOffset.TryParse(req.Query["from"].Single(), out fromTimestamp))
                        return new BadRequestErrorMessageResult("'from' in query is not valid date");

                var toTimestamp = DateTimeOffset.Now;
                if (req.Query.ContainsKey("to") && req.Query["to"].Count == 1)
                    if (!DateTimeOffset.TryParse(req.Query["to"].Single(), out toTimestamp))
                        return new BadRequestErrorMessageResult("'to' in query is not valid date");

                log.LogInformation($"From: {fromTimestamp}; To: {toTimestamp}.");

                var sensor =
                    await _dbContext.DeviceInstallations.SingleOrDefaultAsync(x => x.Id == id,
                        cancellationToken);
                if (sensor == null) return new NotFoundObjectResult(new {message = $"No sensor found with id: {id}"});

                var samples = await _dbContext.Samples.Where(x =>
                        x.InstallationId == id && x.Timestamp >= fromTimestamp && x.Timestamp <= toTimestamp)
                    .Select(p => new SampleResource
                    {
                        Timestamp = p.Timestamp,
                        AirTemp = p.ProbeAirTemp,
                        SoilTemp = p.ProbeSoilTemp,
                        SoilMoisture = p.ProbeMoisture,
                        Humidity = p.AmbientHumidity,
                        Light = p.Light,
                        Co2 = p.Co2,
                    }).ToArrayAsync(cancellationToken);

                return new JsonResult(new DeviceSamplesResource
                    {
                        Sensor = new DeviceInstallationResource
                        {
                            Id = sensor.Id,
                            Serial = sensor.Serial,
                            Title = sensor.Title,
                        },
                        DateRange = new DateRange
                        {
                            StartDate = fromTimestamp,
                            EndDate = toTimestamp
                        },
                        Samples = samples,
                    },
                    JsonSerializerSettings);
            }
            catch (Exception ex)
            {
                _exceptionReporter.ReportException(ex);
                throw;
            }
        }
    }
}