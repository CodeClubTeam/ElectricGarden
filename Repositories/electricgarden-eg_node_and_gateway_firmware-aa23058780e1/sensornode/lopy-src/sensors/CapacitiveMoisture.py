from .Analog import Analog
from time import sleep_ms
class CapacitiveMoisture(Analog):

    name = "Capacitive Moisture Sensor"
    description = "Arduino capacitive moisture sensor connected to an ADC pin"

    def __init__(self, pin):
        Analog.__init__(self, pin)
    
    def moisture(self):
        """ Analog pin is -11dB, so reads 0-3V3. 
            Moisture sensor outputs 0-3V0. 
            Moisture sensor is inverted logic, 0V is moist, 3V0 is dry.
        """
        avgs = [] # Takes 10 samples
        for _ in range(10):
            volts = min(3, max(0, self.voltage())) # Voltage, clamped 
            avgs.append(100 - volts / 0.03) # Divide by 3, times by 100, invert.
            sleep_ms(50)
        return sum(avgs) / len(avgs)
    