using System;
using Microsoft.Extensions.Logging;
using Mindscape.Raygun4Net;

namespace KioskApi.Services
{
    public class UnhandledExceptionReporter
    {
        private readonly ILogger _log;

        public UnhandledExceptionReporter(ILogger log)
        {
            _log = log;
        }

        public void ReportException(Exception exception)
        {
            var apiKey = Environment.GetEnvironmentVariable("RAYGUN_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                _log.LogWarning($"Unhandled error but no raygun api key so not reported");
                return;
            }

            new RaygunClient(apiKey).SendInBackground(exception);
        }
    }
}