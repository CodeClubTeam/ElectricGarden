using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Google.Apis.Auth.OAuth2;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using System.IO;
using Newtonsoft.Json;
using System.Threading;
using Newtonsoft.Json.Linq;

namespace ElectricGardenManufacturingViewer
{
    class SettingsDataStore : IDataStore
    {
        class JsonSettingsStoreEntry
        {
            public object Entry { get; set; }
        }
        
        class JsonSettingsStore
        {
            public Dictionary<string, JsonSettingsStoreEntry> Entries { get; private set; } = new Dictionary<string, JsonSettingsStoreEntry>();
        }

        private JsonSettingsStore LoadStore()
        {
            var blob = Properties.Settings.Default.GToken;
            if (String.IsNullOrEmpty(blob))
            {
                return new JsonSettingsStore();
            } else
            {
                using (var reader = new StringReader(blob)) {
                    var serializer = JsonSerializer.CreateDefault();
                    using (var jsonReader = new JsonTextReader(reader))
                    {
                        return serializer.Deserialize<JsonSettingsStore>(jsonReader);
                    }
                }
            }
        }

        private void SaveStore(JsonSettingsStore store)
        {
            if (store == null)
            {
                return;
            }
            using (var writer = new StringWriter())
            {
                var serializer = JsonSerializer.CreateDefault();
                using (var jsonWriter = new JsonTextWriter(writer))
                {
                    serializer.Serialize(jsonWriter, store);
                }
                writer.Flush();
                var blob = writer.ToString();
                Properties.Settings.Default.GToken = blob;
                Properties.Settings.Default.Save();
                Properties.Settings.Default.Reload();
            }
        }

        public async Task ClearAsync()
        {
            await Task.Run(() =>
            {
                var store = LoadStore();
                store.Entries.Clear();
                SaveStore(store);
            });
        }

        public async Task DeleteAsync<T>(string key)
        {
            await Task.Run(() =>
            {
                var store = LoadStore();
                if (store.Entries.ContainsKey(key))
                {
                    store.Entries.Remove(key);
                }
                SaveStore(store);
            });
        }

        public async Task<T> GetAsync<T>(string key)
        {
            return await Task.Run(() =>
            {
                var store = LoadStore();
                if (!store.Entries.ContainsKey(key))
                {
                    return default(T);
                }
                var entry = store.Entries[key].Entry;
                var resultObj = (entry as JObject).ToObject<T>();
                return resultObj;
            });
        }

        public async Task StoreAsync<T>(string key, T value)
        {
            await Task.Run(() =>
            {
                var store = LoadStore();
                var entry = new JsonSettingsStoreEntry()
                {
                    Entry = value
                };
                store.Entries[key] = entry;
                SaveStore(store);
            });
        }
    }

    class FriendlyNames
    {
        static string[] Scopes = { SheetsService.Scope.Spreadsheets };
        static string ApplicationName = "Electric Garden Manufacturing - Google Sheets Integration";
        static string SheetID = "1L4enwse5PtFtqrbLMjIUijrvVS4QS1_hZnfC1i-Pibg";//"1L4enwse5PtFtqrbLMjIUijrvVS4QS1_hZnfC1i-Pibg";
        static string SheetRange = "A2:D";
        static UserCredential credential;
        static List<FriendlyNameRegisterEntry> cache = null;


        static void LoadCredentials()
        {
            using (var stream = new MemoryStream(Properties.Resources.credentials))
            {
                var store = new SettingsDataStore();
                try
                {
                    var clientSecrets = GoogleClientSecrets.Load(stream);
                    var waitThread = new Thread(() =>
                    {
                        credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                                            clientSecrets.Secrets,
                                            Scopes,
                                            "user",
                                            CancellationToken.None,
                                            store).Result;
                    });

                    waitThread.Start();
                    if (!waitThread.Join(60000))
                    {
                        throw new Exception("Failed to get credentials for Google API.");
                    }
                }
                catch (Exception)
                {
                    // Try once more, after clearing existing tokens.
                    store.ClearAsync().Wait();
                    var clientSecrets = GoogleClientSecrets.Load(stream);
                    var waitThread = new Thread(() =>
                    {
                        credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                                            clientSecrets.Secrets,
                                            Scopes,
                                            "user",
                                            CancellationToken.None,
                                            store).Result;
                    });
                    waitThread.Start();
                    if (!waitThread.Join(60000))
                    {
                        throw new Exception("Failed to get credentials for Google API.");
                    }
                }
            }
        }

        static SheetsService CreateService()
        {
            LoadCredentials();

            var service = new SheetsService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName
            });

            return service;
        }

        protected async static Task<IList<object>> ReadOne(string Range)
        {
            var service = CreateService();
            var request = service.Spreadsheets.Values.Get(SheetID, Range);
            var response = await request.ExecuteAsync();
            var values = response.Values;
            return values[0];
        }

        protected async static Task<IList<IList<object>>> ReadAll()
        {
            var service = CreateService();
            var request = service.Spreadsheets.Values.Get(SheetID, SheetRange);
            var response = await request.ExecuteAsync();
            var values = response.Values;
            return values;
        }

        protected async static Task WriteOne(string Range, IList<object> data)
        {
            var currentData = await ReadOne(Range);

            if (!currentData[0].Equals(data[0]))
            {
                cache = null;
                throw new ThreadStateException("Cannot write back data, modification detected: UID order changed.");
            }

            var service = CreateService();
            var request = service.Spreadsheets.Values.Update(new ValueRange()
            {
                Range = Range,
                Values = new List<IList<object>>(new[] { data }),
            }, SheetID, Range);
            request.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.USERENTERED;
            var response = await request.ExecuteAsync();
        }

        protected async static Task WriteAll(IList<IList<object>> data)
        {
            var currentData = await ReadAll();
            if (data.Count != currentData.Count)
            {
                cache = null;
                throw new ThreadStateException("Cannot write back data, modification detected: length changed");
            }

            for (var i = 0; i < currentData.Count; i++)
            {
                if (!currentData[i][0].Equals(data[i][0]))
                {
                    cache = null;
                    throw new ThreadStateException("Cannot write back data, modification detected: UID order changed.");
                }
            }

            var service = CreateService();
            var request = service.Spreadsheets.Values.Update(new ValueRange()
            {
                Range = SheetRange,
                Values = data,
            }, SheetID, SheetRange);
            request.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.USERENTERED;
            var response = await request.ExecuteAsync();
        }

        public async static Task<IList<FriendlyNameRegisterEntry>> Entries()
        {
            if (cache != null)
            {
                return cache;
            }
            else
            {
                var data = await ReadAll();
                List<FriendlyNameRegisterEntry> entries = new List<FriendlyNameRegisterEntry>();
                for (var row = 0; row < data.Count; row++)
                {
                    var item = data[row];
                    entries.Add(new FriendlyNameRegisterEntry(int.Parse(item[0] as String), row + 2)
                    {
                        Name = item[1] as String,
                        SerialNumber = item[2] as String
                    });
                }
                return entries;
            }
        }

        public class FriendlyNameRegisterEntry
        {
            public FriendlyNameRegisterEntry(int UID, int RowNumber)
            {
                this.UID = UID;
                this.RowNumber = RowNumber;
            }

            public int UID { get; private set; }
            public string Name { get; set; }
            public string SerialNumber { get; set; }
            private int RowNumber { get; set; }

            public async Task Read()
            {
                try
                {
                    // Try read by row.
                    var row = await FriendlyNames.ReadOne(String.Format("A{0}:D{0}", RowNumber));
                    if (int.Parse(row[0] as String) != UID)
                    {
                        throw new ThreadStateException("Data out of date, full pull.");
                    }
                    Name = row[1] as String;
                    SerialNumber = row[2] as String;
                } catch (ThreadStateException)
                {
                    var allData = await FriendlyNames.ReadAll();
                    var row = allData.First(item => int.Parse(item[0] as String) == UID);
                    RowNumber = allData.IndexOf(row);
                    Name = row[1] as String;
                    SerialNumber = row[2] as String;
                }
            }

            public async Task Write()
            {
                try
                {
                    await FriendlyNames.WriteOne(String.Format("A{0}:C{0}", RowNumber), new List<object>( new [] { UID.ToString(), Name, SerialNumber }));
                }
                catch (ThreadStateException)
                {
                    var allData = await FriendlyNames.ReadAll();
                    var row = allData.First(item => int.Parse(item[0] as String) == UID);
                    RowNumber = allData.IndexOf(row);
                    row[1] = Name;
                    row[2] = SerialNumber;
                    await FriendlyNames.WriteAll(allData);
                }
            }
        }
    }
}
