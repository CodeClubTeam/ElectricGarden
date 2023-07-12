from .MCP3021 import MCP3021
from pycom import nvs_get
from util import int_to_float

class EGMoisture(MCP3021):

    name = "Moisture Sensor"
    description = "Electric Garden Moisture Sensor v.1.0"

    def __init__(self, bus, address):
        MCP3021.__init__(self, bus, address, 3.3)
        self.a = int_to_float(nvs_get('mseq.a'))
        self.b = int_to_float(nvs_get('mseq.b'))
        self.c = int_to_float(nvs_get('mseq.c'))
        if self.a is None or self.b is None or self.c is None:
            raise Exception("Constants missing for moisture sensor calibration")


    def read(self):
        raw_adc = MCP3021.read(self)
        return self.a * self.b**(self.c*raw_adc)