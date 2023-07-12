import eventhub 
import random

eh = eventhub.EventHub({
    'endpoint': 'https://eg-event-ingress.servicebus.windows.net/sensorhub',
    'keyname': 'SendOnlySAS',
    'key': 'QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM=',
    'url': 'https://eg-event-ingress.servicebus.windows.net/sensorhub/messages'
})

def poco_utc_now(deltaSeconds:float=0):
    import datetime 
    return (datetime.datetime.now() + datetime.timedelta(seconds=deltaSeconds) + datetime.timedelta(hours=-10)).isoformat()

def poco_sensor_reading(sensorID:str, sensorValue:str):
    return {
        "SensorID": sensorID,
        "SensorValue": sensorValue
    }

def poco_sensor_event(deltaSeconds:float, nodeID:str, readings:list):
    return {
        "EventTime": poco_utc_now(deltaSeconds),
        "NodeID": nodeID,
        "Readings": readings
    }

def poco_sensor_event_envelope(deltaSeconds:float, gatewayId:str, sensorEvents:list):
    return {
        "PublishTime": poco_utc_now(deltaSeconds),
        "GatewayID": gatewayId,
        "Events": sensorEvents
    }

def generate_false_events(envelopeCount:int, sensorEventCount:int, backInTimeMax:int):
    envelopes = []
    for j in range(envelopeCount):
        sensors = []
        for i in range(sensorEventCount):
            readings = []
            if random.random() > .5:
                readings.append(poco_sensor_reading("soilTemperature", random.randint(18, 23)))
            readings.append(poco_sensor_reading("soilMoisture", random.randint(30, 80)))
            if random.random() > .8:
                readings.append(poco_sensor_reading("ambientTemperature", random.randint(20, 28)))
            if random.random() > .9:
                readings.append(poco_sensor_reading("ambientHumidity", random.randint(40, 92)))
            sensors.append(poco_sensor_event(-random.randint(0, backInTimeMax), "GardenSensor/" + str(j+1) + "/" + str(i+1), readings))
        envelopes.append(poco_sensor_event_envelope(0, "TestGateway/" + str(j+1), sensors))
    return envelopes

def package_envelopes(envelopes:list):
    payload = []
    try:
        import json as ujson 
    except:
        import ujson
    for envelope in envelopes:
        envelope_str = ujson.dumps(envelope)
        payload.append({"Body": envelope_str})
    return payload 

print(eh)
print("Pre Dispatch")
print(eh.token)
print(eh.tokenExpires)
print("Dispatching test payload")
import time
def dispatch():
    envelopes = generate_false_events(10, 20, 60 * 180) # Sensor events for the last half an hour, from 5 gateways
    payload = package_envelopes(envelopes)
    response = eh.publish_multiple(payload)
    print(response)

for l in range(100):
    dispatch()
