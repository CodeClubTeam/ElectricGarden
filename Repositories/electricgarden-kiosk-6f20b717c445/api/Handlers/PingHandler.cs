using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace KioskApi.Handlers
{
    public static class PingHandler
    {
        [FunctionName("Ping")]
        public static IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ping")]
            HttpRequest req,
            ILogger log)
        {
            return new NoContentResult();
        }
    }
}