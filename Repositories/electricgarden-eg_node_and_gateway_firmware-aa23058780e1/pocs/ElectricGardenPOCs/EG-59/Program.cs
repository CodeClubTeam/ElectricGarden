using System;
using System.Net;
using System.Web;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.Security.Cryptography;
using System.Globalization;

namespace EG_59
{
    class Program
    {
        const string EH_NAMESPACE = "eg-event-ingress";
        const string EH_EVENTHUB = "sensorhub";
        const string EH_APIVERSION = "2014-01";
        const string EH_PUBLISHER = "EG59_test_publisher";
        const string EH_CONTENTTYPE = "application/atom+xml;type=entry;charset=utf-8";
        const string EH_XMSRETRYPOLICY = "NoRetry";
        const string EH_CONNECTIONSTRING = "Endpoint=sb://eg-event-ingress.servicebus.windows.net/;SharedAccessKeyName=SendOnlySAS;SharedAccessKey=QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM=";

        static Uri EH_URI = null;

        // The "Do what I tell you" Request Creator.
        class WebRequestCreator : IWebRequestCreate
        {
            public WebRequest Create(Uri uri)
            {
                var request = WebRequest.CreateHttp(uri);
                request.ContentType = EH_CONTENTTYPE;
                request.Headers["x-ms-retrypolicy"] = EH_XMSRETRYPOLICY;
                return request;
            }
        }

        static HttpWebRequest EventHubWebClient(string sasToken)
        {
            var client = WebRequest.Create(EH_URI);
            client.Headers["Authorization"] = sasToken;
            return client as HttpWebRequest;
        }

        private static string CreateToken(string resourceUri, string keyName, string key, int expireSeconds = 60 * 60 * 24 * 7 /* One Week */)
        {
            TimeSpan sinceEpoch = DateTime.UtcNow - new DateTime(1970, 1, 1);
            var expiry = Convert.ToString((int)sinceEpoch.TotalSeconds + expireSeconds);
            string stringToSign = HttpUtility.UrlEncode(resourceUri) + "\n" + expiry;
            HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign)));
            var sasToken = String.Format(CultureInfo.InvariantCulture, "SharedAccessSignature sr={0}&sig={1}&se={2}&skn={3}", HttpUtility.UrlEncode(resourceUri), HttpUtility.UrlEncode(signature), expiry, keyName);
            return sasToken;
        }

        private static string CreateTokenFromConnectionString(string connectionString)
        {
            var root = HttpUtility.ParseQueryString(EH_CONNECTIONSTRING.Replace(";", "&"));
            return CreateToken(root["Endpoint"], root["SharedAccessKeyName"], root["SharedAccessKey"], 600 /* 10 Minutes */);
        }

        static void Main(string[] args)
        {
            WebRequest.RegisterPrefix("https://", new WebRequestCreator());
            EH_URI = new Uri($"https://{EH_NAMESPACE}.servicebus.windows.net/{EH_EVENTHUB}/messages");
            var sharedAccessSignatureToken = CreateTokenFromConnectionString(EH_CONNECTIONSTRING);
            var client = EventHubWebClient(sharedAccessSignatureToken);
            client.post
            {
                byte[] returnValue = client.UploadValues(EH_URI, new NameValueCollection()
                {
                    { "TestKey", "TestValue"}
                });
                Console.WriteLine("Return Value {}", returnValue);
            }
        }
    }
}
