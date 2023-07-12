import time
import json 
class SensorReading(object):
    def __init__(self, sensorID:str, moment):
        self.sensorID = sensorID
        self.moment = moment
        self._store = None
    
    def value(self, value:object=None):
        if value is not None:
            self._store = value 
        return self

    def serialize(self):
        return str(self._store)

    @property
    def node(self):
        return self.moment.node

    @property 
    def gateway(self):
        return self.node.gateway

class SensorReadingMoment(object):
    def __init__(self, when:int, node):
        self.when = when 
        self.node = node 
        self.readings = dict()

    def sensor(self, sensorID:str, sensorReading=None):
        if not sensorID in self.readings:
            self.readings[sensorID] = SensorReading(sensorID, self)
        if sensorReading is not None:
            self.readings[sensorID].value(sensorReading)
        return self.readings[sensorID]

    def serialize(self):
        serial = {'T': self.when}
        for sensor, reading in self.readings.items():
            serial[sensor] = reading.serialize()
        return serial 
    
    @property 
    def gateway(self):
        return self.node.gateway

class NodeReport(object):
    def __init__(self, nodeID:str, gateway):
        self.nodeID = nodeID 
        self.gateway = gateway
        self.moments = {}
    
    def moment(self, time:int):
        # Ensure time is in seconds 
        time = int(time)
        if not time in self.moments:
            self.moments[time] = SensorReadingMoment(time, self)
        return self.moments[time]

    def serialize(self):
        serial = []
        for _,moment in self.moments.items():
            serial.append(moment.serialize())
        return serial 

class Gateway(object):
    def __init__(self, gatewayID:str):
        self.gatewayID = gatewayID
        self.hb = False
        self.parameters = None
        self.nodes = dict()

    def node(self, nodeID:str):
        if not nodeID in self.nodes:
            self.nodes[nodeID] = NodeReport(nodeID, self)
        return self.nodes[nodeID]
    
    def heartbeat(self, parameters=None):
        self.hb = True
        if parameters is not None:
            self.parameters = parameters
    
    def serialize(self):
        serial = {'GID': self.gatewayID}
        if self.hb: # Heartbeat
            # Current time
            serial['HB'] = {
                'now': time.time()
            }
            # Additional information
            if self.parameters:
                for key in self.parameters:
                    if self.parameters[key]:
                        serial['HB'][key] = self.parameters[key]
            # Convert to json string, because its easier for now.
            serial['HB'] = json.dumps(serial['HB'])
        
        for nodeID, node in self.nodes.items():
            serial[nodeID] = node.serialize()
        return serial 