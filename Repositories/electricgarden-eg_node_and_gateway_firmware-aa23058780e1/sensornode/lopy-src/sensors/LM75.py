from time import sleep_ms 
from .I2CSensor import I2CSensor
from struct import unpack

class LM75(I2CSensor):

    name = "LM75 Temperature Sensor"
    description = "Temperature Sensor"

    def __init__(self, bus, address):
        I2CSensor.__init__(self, bus, address)
    
    def read(self):
        s16, = unpack('>h', I2CSensor.read(self, 2))
        return s16 / 256 # (1 << 8)