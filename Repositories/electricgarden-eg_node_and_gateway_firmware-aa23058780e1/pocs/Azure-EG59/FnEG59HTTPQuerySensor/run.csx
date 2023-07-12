#r "System.Configuration"
#r "System.Data"

using System;
using System.Net;
using System.Data;
using System.Text;
using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;

static string connectionString = ConfigurationManager.ConnectionStrings["eg-sql-azure"].ConnectionString;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    // parse query parameter
    string nodeid = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key.ToLower(), "nodeid", true) == 0)
        .Value;

    string dumpall = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key.ToLower(), "dumpall", true) == 0)
        .Value;

    if (nodeid == null)
    {
        // Get request body
        dynamic data = await req.Content.ReadAsAsync<object>();
        nodeid = data?.nodeid;
    }

    if (dumpall != null) {
        using (SqlConnection conn = new SqlConnection(connectionString))
        {

            conn.Open();

            using (SqlCommand cmd = new SqlCommand("spDumpAllReadings", conn) {
                CommandType = CommandType.StoredProcedure
            })
            {
                var reader = await cmd.ExecuteReaderAsync();
                if (!reader.HasRows) {
                    return new HttpResponseMessage(HttpStatusCode.OK) {
                        Content = new StringContent("[]", Encoding.UTF8, "application/json")
                    };
                } else {
                    var jsonResult = new StringBuilder();
                    while (reader.Read())
                    {
                        jsonResult.Append(reader.GetValue(0).ToString());
                    }
                    return new HttpResponseMessage(HttpStatusCode.OK) {
                        Content = new StringContent(jsonResult.ToString(), Encoding.UTF8, "application/json")
                    };
                }
            }
        }
    }

    if (nodeid == null) {
        return req.CreateResponse(HttpStatusCode.BadRequest, 
            new {
                Error = "No critera provided"
            });
    }
    log.Info($"C# HTTP trigger function processing query for Node: {nodeid}.");

    using (SqlConnection conn = new SqlConnection(connectionString))
    {

        conn.Open();

        using (SqlCommand cmd = new SqlCommand("spQuerySensors", conn) {
            CommandType = CommandType.StoredProcedure
        })
        {
            cmd.Parameters.Add(new SqlParameter("@NodeID", nodeid));
            var reader = await cmd.ExecuteReaderAsync();
            if (!reader.HasRows) {
                return new HttpResponseMessage(HttpStatusCode.OK) {
                    Content = new StringContent("[]", Encoding.UTF8, "application/json")
                };
            } else {
                var jsonResult = new StringBuilder();
                while (reader.Read())
                {
                    jsonResult.Append(reader.GetValue(0).ToString());
                }
                return new HttpResponseMessage(HttpStatusCode.OK) {
                    Content = new StringContent(jsonResult.ToString(), Encoding.UTF8, "application/json")
                };
            }
        }
    }
}
