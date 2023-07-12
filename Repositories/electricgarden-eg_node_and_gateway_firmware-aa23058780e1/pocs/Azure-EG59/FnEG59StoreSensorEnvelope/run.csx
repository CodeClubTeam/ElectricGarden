#r "System.Configuration"
#r "System.Data"

using System;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;

public static async Task Run(string myQueueItem, TraceWriter log)
{
    log.Info($"Incoming queue item.");
    var str = ConfigurationManager.ConnectionStrings["eg-sql-azure"]?.ConnectionString;
    if (str == null) {
        throw new Exception("[EG-65] SQL DB Connection String was null, perhaps the settings have not propagated to all nodes.");
    }
    using (SqlConnection conn = new SqlConnection(str))
    {
        await conn.OpenAsync();

        using (SqlCommand cmd = new SqlCommand("spInsertGatewayEnvelope", conn) {
            CommandType = CommandType.StoredProcedure
        })
        {
            cmd.Parameters.Add(new SqlParameter("@Blob", myQueueItem));
            var rows = await cmd.ExecuteNonQueryAsync();
            log.Info($"{rows} rows were updated");
        }
    }
}
