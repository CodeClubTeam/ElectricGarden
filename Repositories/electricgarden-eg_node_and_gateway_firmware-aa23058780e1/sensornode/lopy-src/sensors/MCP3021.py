from time import sleep_ms
from .I2CSensor import I2CSensor

class MCP3021(I2CSensor):

    name = "MCP3021 ADC"
    description = "Analog to Digital converter, 10-bit I2C SAR A/D."

    def __init__(self, bus, address, vdd=3.3):
        I2CSensor.__init__(self, bus, address)
        self.vdd = vdd
    
    def read(self):
        I2CSensor.read(self, 2) # Wake up the ADC
        sleep_ms(50) # Conversion time is slow after being asleep for a while.
        high, low = I2CSensor.read(self, 2) # Get actual reading
        i10 = high << 6 | low >> 2
        return i10

    def voltage(self):
        return self.read() * self.vdd / 1024