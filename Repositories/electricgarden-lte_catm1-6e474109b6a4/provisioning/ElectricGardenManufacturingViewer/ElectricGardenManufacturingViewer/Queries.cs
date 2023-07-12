using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ElectricGardenManufacturingViewer
{
    public class LogDocument
    {
        public string _type;
        public string timestamp;
        public string user;
        public string machine;
        public string serial;
        public LogRecord record;
    }

    public class LogRecord
    {
        public string message;
        public string level;
    }

    public interface IQueries{
        Task<List<dynamic>> GetDevices();
        Task<List<LogDocument>> GetLogs(string serial);
    }

    public class ApiQueries: IQueries {

        private System.Net.WebClient client = null;
        private JsonSerializerSettings serializationSettings = null;
        private string base_uri = null;

        public ApiQueries(){
            base_uri = System.Environment.GetEnvironmentVariable("API_BASE");
            var key = System.Environment.GetEnvironmentVariable("API_KEY");
            var keyBytes = System.Text.Encoding.UTF8.GetBytes(key);
            var keyEncoded = System.Convert.ToBase64String(keyBytes);
            client = new System.Net.WebClient();
            client.Headers.Add(System.Net.HttpRequestHeader.Authorization, "Basic " + keyEncoded);
            serializationSettings = new JsonSerializerSettings();
            serializationSettings.DateParseHandling = DateParseHandling.None;
        }

        public async Task<List<dynamic>> GetDevices(){
            var response =  await GetData<dynamic>("thing/list");
            return response
                .Where( x => ((JObject)x).Property("instantiated") != null)
                .ToList();
        }
        public async Task<List<LogDocument>> GetLogs(string serial){
            var resource =  String.Format("thing/{0}/logs", serial);
            return await GetData<LogDocument>(resource);
        }

        private async Task<List<T>> GetData<T>( string uri ){
            var json = await client.DownloadStringTaskAsync(base_uri + uri);
            var response = JsonConvert.DeserializeObject<ApiResponse<List<T>>>(json, serializationSettings);
            return response.value;
        }

        private class ApiResponse<T> {
            public string success {get;set;}
            public T value {get;set;}
        }

    }
}