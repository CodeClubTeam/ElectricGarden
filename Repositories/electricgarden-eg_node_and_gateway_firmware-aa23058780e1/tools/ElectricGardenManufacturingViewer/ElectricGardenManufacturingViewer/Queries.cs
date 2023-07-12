using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using MongoDB.Driver.Core;

namespace ElectricGardenManufacturingViewer
{
    [BsonIgnoreExtraElements]
    public class LogDocument
    {
        public string _type;
        public string timestamp;
        public string user;
        public string machine;
        public string serial;
        public LogRecord record;
    }

    [BsonIgnoreExtraElements]
    public class LogRecord
    {
        public string message;
        public string level;
    }

    public class Queries
    {
        static MongoClient client = new MongoClient("mongodb://electric-garden-cosmos:1zuvaBXL9eATAsSxz1scmHWpNfnq5IY1inExxnT4NvnqMzotn8OTHaeL0LzYnkb2xjuFkolAbMvYnz8mkwxU0w==@electric-garden-cosmos.documents.azure.com:10255/?ssl=true&replicaSet=globaldb");
        static IMongoDatabase database = null;
        static IMongoCollection<dynamic> collection = null;
        static IMongoCollection<LogDocument> log_collection = null;
        static Queries() {
            database = client.GetDatabase("admin");
            collection = database.GetCollection<dynamic>("manufacture");
            log_collection = database.GetCollection<LogDocument>("manufacture");
        }

        public static async Task<List<dynamic>> GetDevices()
        {
            return await collection.Find(Builders<dynamic>.Filter.Eq("_type", "thing")).ToListAsync();
        }

        public static async Task<List<LogDocument>> GetLogs(string serial)
        {
            return await log_collection.Find<LogDocument>(doc => doc._type == "log" && doc.serial == serial).ToListAsync();
        }
    }
}
