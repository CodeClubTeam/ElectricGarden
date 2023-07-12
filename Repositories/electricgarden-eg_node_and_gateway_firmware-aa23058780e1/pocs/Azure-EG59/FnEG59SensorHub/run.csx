#r "Newtonsoft.Json"

using System;
using Newtonsoft.Json;

public class POCOEG59SensorEventEnvelope {
    public DateTime PublishTime {get; set;}
    public string GatewayID {get; set;}
    public POCOEG59SensorEvent[] Events {get; set;}
}

public class POCOEG59SensorEvent {
    public DateTime EventTime {get; set;}
    public string NodeID {get; set;}
    public POCOEG59SensorReading[] Readings {get; set;}
}

public class POCOEG59SensorReading {
    public string SensorID {get; set;}
    public string SensorValue {get; set;}
}

public class POCOEG59SensorEventQueueItem {
    public DateTime PublishTime {get; set;}
    public DateTime EventTime {get; set;}
    public string GatewayID {get; set;}
    public string NodeID {get; set;}
    public string SensorID {get; set;}
    public string SensorValue {get; set;}
}

private static T Deserialize<T>(string payload) {
    return JsonConvert.DeserializeObject<T>(payload);
}

public static void Run(string[] envelopes, 
    ICollector<POCOEG59SensorEventQueueItem> outSensorEvents, 
    ICollector<POCOEG59SensorEventEnvelope> outSensorEnvelope, 
    TraceWriter log)
{
    log.Info($"C# Event Hub triggered with {envelopes.Length} messages.");
    int queuedEvents = 0;
    foreach (var envelope in envelopes) {
        try {
            var poco = Deserialize<POCOEG59SensorEventEnvelope>(envelope);
            outSensorEnvelope.Add(poco);
            //log.Info($"Received Envelope from {poco.GatewayID}, Time: {poco.PublishTime}, {poco.Events.Length} events.");
            foreach (var sensorEvent in poco.Events) {
                //log.Info($"\tNode: {sensorEvent.NodeID}, Time: {sensorEvent.EventTime}, {sensorEvent.Readings.Length} readings.");
                foreach (var sensorReading in sensorEvent.Readings) {
                //    log.Info($"\t\tSensor: {sensorReading.SensorID}, Reading: {sensorReading.SensorValue}.");
                    var queueItem = new POCOEG59SensorEventQueueItem() {
                        PublishTime = poco.PublishTime,
                        GatewayID = poco.GatewayID,
                        EventTime = sensorEvent.EventTime,
                        NodeID = sensorEvent.NodeID,
                        SensorID = sensorReading.SensorID,
                        SensorValue = sensorReading.SensorValue
                    };
                    outSensorEvents.Add(queueItem);
                    queuedEvents++;
                }
            }
        } catch (Exception e) {
            log.Error($"I choked trying to parse {envelope}. {e}");
        }
    }
    log.Info($"C# Event Hub queued {queuedEvents} events.");
}
