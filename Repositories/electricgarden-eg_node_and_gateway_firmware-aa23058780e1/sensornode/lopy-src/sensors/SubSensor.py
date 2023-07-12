from .Sensor import Sensor
class SubSensor(Sensor):

    name = "Virtual Sensor Proxy"
    description = "Retrieves information from another sensors's sub-properties"

    def __init__(self, sensor, sensor_child):
        self.sensor = sensor 
        self.child = 'read_%s' %sensor_child
    
    def read(self):
        sensor_fn = getattr(self.sensor, self.child, None)
        if sensor_fn is None:
            raise Exception('SubSensor failed to retrieve data from %s, %s' %(str(self.sensor), self.child))
        return sensor_fn()