import sys
import json
from I2CManager import I2CManager

__sensor_classes = {}

def __discover_sensors():
    # Imports "class FileName" from "FileName.py" in sensors/
    from os import listdir 
    __moduledir = __path__ 
    __sensors = [sensor[:-3] for sensor in listdir(__moduledir) if sensor not in ['__init__.py', 'Sensor.py'] and sensor[-3:] == '.py']
    for __sensor in __sensors:
        __exec_statement = 'from .{0} import {0}'.format(__sensor)
        exec(__exec_statement) # Another option is to use __import__ for dynamic imports
        __sensor_class = eval('%s' %__sensor)
        __sensor_classes[__sensor] = __sensor_class

class SensorManager:
    def __init__(self, sensor_classes, i2c_manager):
        self.config = None
        self.sensor_classes = sensor_classes
        self.i2c_manager = i2c_manager
        self.sensors = {}
    
    def _apply_config(self):
        config = self.config
        busses, sensors = config['busses'], config['sensors']
        for bus, bus_config in busses.items():
            self.i2c_manager.add_bus(bus, **bus_config)
        
        for sensor, sensor_config in sensors.items():
            if ':disabled' in sensor:
                continue
            klass = sensor_config[':type']
            initialization_parameters = { key: value for key, value in sensor_config.items() if key[0] != ':' }
            sub_sensors = sensor_config.get(':sub', None)
            print('[SENSING] Instantiating %s(%s)' %(sensor, self.sensor_classes[klass].name))
            if sub_sensors != None:
                SubSensor = self.sensor_classes['SubSensor']
                parent_sensor_instance = self.sensor_classes[klass](**initialization_parameters)
                for sub_sensor in sub_sensors:
                    print('[SENSING] \t%s_%s ready' %(sensor, sub_sensor))
                    self.sensors['%s_%s'%(sensor, sub_sensor)] = SubSensor(parent_sensor_instance, sub_sensor)
            else:
                self.sensors[sensor] = self.sensor_classes[klass](**initialization_parameters) 

    def load_config(self):
        print('[SENSING] Loading sensor config')
        with open('/flash/conf/sensors.json', 'r') as config_file:
            self.config = json.load(config_file)
        self._apply_config()

    def read_sensor(self, name):
        sensor = self.sensor(name)
        if sensor is None:
            raise Exception('Invalid sensor to read from: %s' %sensor)
        try:
            return sensor.read()
        except Exception as e:
            print('Failed to read sensor')
            sys.print_exception(e)
            return None
    
    def sensor_names(self):
        return list(self.sensors.keys())
    
    def sensor(self, name):
        return self.sensors.get(name, None)

__discover_sensors()
del __discover_sensors

MANAGER = SensorManager(__sensor_classes, I2CManager.manager())
