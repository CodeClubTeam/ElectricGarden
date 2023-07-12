using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using AzureFunctions.Extensions.Swashbuckle.Attribute;
using KioskApi.Models.Projections;
using KioskApi.Persistence;
using KioskApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace KioskApi.Handlers
{
    public class InactiveDevicesHandler
    {
        private static readonly JsonSerializerSettings JsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        private readonly AppDbContext _dbContext;
        private readonly UnhandledExceptionReporter _exceptionReporter;

        public InactiveDevicesHandler(AppDbContext dbContext, UnhandledExceptionReporter exceptionReporter)
        {
            _dbContext = dbContext;
            _exceptionReporter = exceptionReporter;
        }

        [FunctionName("GetInactiveDevices")]
        [ProducesResponseType(typeof(InactiveDevice), (int) HttpStatusCode.OK)]
        [QueryStringParameter("from", "from timestamp", DataType = typeof(DateTimeOffset), Required = false)]
        [QueryStringParameter("to", "to timestamp", DataType = typeof(DateTimeOffset), Required = false)]
        public async Task<IActionResult> Get(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "inactive-devices")]
            [RequestBodyType(typeof(void), "None")]
            HttpRequest req,
            ILogger log)
        {
            try
            {
                log.LogInformation($"GET inactive-devices");

                var fromTimestamp = DateTimeOffset.Now.Subtract(TimeSpan.FromDays(1));
                if (req.Query.ContainsKey("from") && req.Query["from"].Count == 1)
                    if (!DateTimeOffset.TryParse(req.Query["from"].Single(), out fromTimestamp))
                        return new BadRequestErrorMessageResult("'from' in query is not valid date");

                var toTimestamp = DateTimeOffset.Now;
                if (req.Query.ContainsKey("to") && req.Query["to"].Count == 1)
                    if (!DateTimeOffset.TryParse(req.Query["to"].Single(), out toTimestamp))
                        return new BadRequestErrorMessageResult("'to' in query is not valid date");

                log.LogInformation($"From: {fromTimestamp}; To: {toTimestamp}.");

                var results = await _dbContext.InactiveDevices.FromSqlRaw(@"
SELECT id, serial, title, last_heard_from
FROM (
    SELECT id, serial, title, MAX([timestamp]) last_heard_from
    FROM device_installation JOIN sample ON device_installation.id = sample.installation_id
    GROUP BY id, serial, title
) as aggr  WHERE last_heard_from >= @from_date AND last_heard_from <= @to_date
", new SqlParameter("from_date", fromTimestamp), new SqlParameter("to_date", toTimestamp)).ToArrayAsync();
                return new JsonResult(new
                {
                    from = fromTimestamp,
                    to = toTimestamp,
                    results
                }, JsonSerializerSettings);
            }
            catch (Exception ex)
            {
                _exceptionReporter.ReportException(ex);
                throw;
            }
        }
    }
}