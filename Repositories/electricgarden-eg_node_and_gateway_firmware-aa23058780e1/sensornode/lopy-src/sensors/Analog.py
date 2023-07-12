from machine import ADC
from .Sensor import Sensor 
ADC_Controller = ADC(0)
# ADC_Controller.vref(1112) #1.112 V 
class Analog(Sensor):

    name = "Generic ADC"
    description = "Reads ADC pin on ESP32"

    def __init__(self, pin, scale=None):
        Sensor.__init__(self)
        # 11dB attenuation gives 0V-3V3
        self.adc = ADC_Controller.channel(pin=pin, attn=ADC.ATTN_11DB)
        self.scale = scale
    
    def read(self):
        return self.adc()
    
    def voltage(self):
        if self.scale is not None:
            return self.scale * self.adc.voltage() / 1024
        return self.adc.voltage() / 1024
    
    def read_voltage(self):
        return self.voltage()